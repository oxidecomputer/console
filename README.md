# Console

Web client to the [Oxide control plane API](https://github.com/oxidecomputer/omicron).

## Tech

- [TypeScript](https://www.typescriptlang.org/)
- [React](https://reactjs.org/) (+ [React Router](https://reactrouter.com/), [React Query](https://react-query.tanstack.com), [React Table](https://react-table.tanstack.com))
- [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) + [Mock Service Workers](https://mswjs.io/)
- [Tailwind](https://tailwindcss.com/)
- [oxide.ts](https://github.com/oxidecomputer/oxide.ts) (generates typed API client from Nexus's [OpenAPI spec](app/docs/nexus-openapi.json))
- [Vite](https://vitejs.dev/)
- [Storybook](https://storybook.js.org/) (see main branch Storybook [here](https://console-ui-storybook.vercel.app/))

## Directory structure

The app is in [`app`](app). You can see the route structure in [`app/routes.tsx`](app/routes.tsx). In [`libs`](libs) we have a [`ui`](libs/ui) dir where the low-level components live (and the Storybook definition) and an [`api`](libs/api) dir where we keep the generated API client and a React Query wrapper for it. These directories are aliased in [`tsconfig.json`](tsconfig.json) for easy import from the main app as `@oxide/ui` and `@oxide/api`, respectively.

## Try it

The fastest way to see the console in action is to check out the repo, run `yarn && yarn start:msw`, and go to http://localhost:4000 in the browser. This runs the console with a mock API server that runs in a Service Worker in the browser.

## Development

### Install dependencies

```
yarn install
```

### Run Storybook

```
yarn storybook
```

This will start the storybook for the `ui` component library and start it on `http://localhost:4400`.

### Run Vite dev server + [MSW](https://mswjs.io/) mock API

This is the easiest way to run the console locally. Just run:

```
yarn start:msw
```

and navigate to http://localhost:4000 in the browser. The running app will automatically update if you change the source code. This mode uses Mock Service Workers to run a whole fake API right the browser. This mock server is also used in tests.

### Run Vite dev server + real Nexus API

You can also run the console against a real instance of Nexus, the API.

#### Run dev server

Run `yarn start` and navigate to http://localhost:4000/ in the browser. The running app will automatically update if you change the source code. It will mostly not work until you run the API.

#### Run API

Clone [omicron](https://github.com/oxidecomputer/omicron) in the same parent directory as the console and install [rustup](https://rustup.rs/). Then:

```
rustup install stable  # install Rust
cargo build  # needs to be run in the omicron directory
npm i -g json
brew install tmux cockroachdb/tap/cockroach
```

The easy way to run everything is to use the `tools/start_api.sh` script, which uses tmux to run multiple processes in different panes and automatically populates some fake data (see `tools/populate_omicron_data.sh` to see exactly what). From the omicron directory, run `tools/start_api.sh`. Since we're assuming `console` and `omicron` are next to each other, that looks like this:

```sh
../console/tools/start_api.sh
```

To stop the API run `tools/stop_api.sh` (which kills the tmux session) or kill the tmux session manually.

<details>
<summary>Configuring tmux</summary

Because running the API requires running two programs plus the populate data script, we use tmux to split the terminal into panes so we can see the log output of all three. tmux has its own complicated set of [keyboard shortcuts](https://tmuxcheatsheet.com/). A good way to avoid having to deal with that if you want to poke around in the server logs is to create `~/.tmux.conf` that looks like this:

```
set -g mouse on
```

This will let you click to focus a pane and scrolling output with the mouse will automatically work. If you do want to use the shortcuts, here's a `tmux.conf` to make it a little more vim-like:

```shell
# change leader key from ctrl-b to ctrl-a
unbind C-b
set-option -g prefix C-a
bind-key C-a send-prefix

# ctrl-a v makes a vertical split, ctrl-a h make a horizontal split
bind v split-window -h
bind s split-window -v
unbind '"'
unbind %

# ctrl-a h/j/k/l move between panes
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

set -g mouse on
```

</details>

<details>
<summary>Running without tmux</summary>

Using the script is strongly recommended, but if you really don't want to, make sure you've done the above setup and then run the commands in `tools/start_api.sh` in separate terminal windows in the same order they are run in that script. Note the dependencies indicated by the `wait_for_up` commands.

</details>

### E2E tests with [Playwright](https://playwright.dev/)

Playwright tests match the filename pattern `.e2e.ts`. The basic command to run all tests is `yarn playwright test`. You may have to run `yarn playwright install` after `yarn install` to get the browser binaries.

Some debugging tricks (see the docs [here](https://playwright.dev/docs/debug) for more details):

- Add `await page.pause()` to a test and run `yarn e2e <test file> --headed --project=chromium` to run a test in a single headed browser with the excellent [Inspector](https://playwright.dev/docs/inspector) open and pause at that line. This is perfect for making sure the screen looks like you expect at that moment and testing selectors to use in the next step.

### Other useful commands

| Command         | Description                                                                        |
| --------------- | ---------------------------------------------------------------------------------- |
| `yarn test run` | Vitest tests                                                                       |
| `yarn test`     | Vitest tests in watch mode                                                         |
| `yarn lint`     | ESLint                                                                             |
| `yarn tsc`      | Check types                                                                        |
| `yarn ci`       | Lint, tests, and types                                                             |
| `yarn fmt`      | Format everything. Rarely necessary thanks to editor integration                   |
| `yarn gen`      | Generate components, stories, tests, etc                                           |
| `yarn gen-api`  | Generate API client (see [`docs/update-pinned-api.md`](docs/update-pinned-api.md)) |

## Relevant documents

### RFDs

- [RFD 4 User-Facing API](https://rfd.shared.oxide.computer/rfd/0004)
- [RFD 43 Identity and Access Management (IAM)](https://rfd.shared.oxide.computer/rfd/0043)
- [RFD 44 Hierarchy and API for User Management and Organizations](https://rfd.shared.oxide.computer/rfd/0044)
- [RFD 156 API Requirements for Console Prototype](https://rfd.shared.oxide.computer/rfd/0156)
- [RFD 169 Console Authentication and Session Management](https://rfd.shared.oxide.computer/rfd/0169)
- [RFD 180 Console v1 Scope](https://rfd.shared.oxide.computer/rfd/0180)

### Figma

- [Component Library](https://www.figma.com/file/D5ukCJbedrlGkUIh0E6QtX/Component-Library)
- [Applied UI Exploration](https://www.figma.com/file/UDMGwny0LIyMUI9d35XVGl/Applied-UI-Exploration)
- [Console Prototype v2 (old)](https://www.figma.com/file/Z4cn380qKc7cqT91YNrbgn/Console-Prototype-v2)
- [Oxide Design System (old)](https://www.figma.com/file/EUf6YnFJx0AKE8GGYDAoRO/Oxide-Design-System)
