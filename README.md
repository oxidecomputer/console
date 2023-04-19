# Console

Web client to the [Control Plane API](https://github.com/oxidecomputer/omicron).

![screenshot of instances list page](docs/readme-screenshot.png)

## Architecture

![](docs/architecture-browser-only.svg)

In order to avoid the complexity of server-side rendering (and running JS on the rack in general), the web console is a fully client-side React app. We use Vite (which uses Rollup internally for production builds) to build a set of assets (`index.html`, JS bundles, CSS, fonts, images) and we serve those assets as static files from a special set of console endpoints in Nexus. From the control plane's point of view, the web console simply is:

- a tarball of static assets + endpoints that serve them
- a few other endpoints to handle auth actions like login/logout
- a table of sessions (not necessarily console-specific)

The web console has no special privileges as an API consumer. We log in (which sets a cookie) and make cookie-authed API requests after that. See [RFD 223 Web Console Architecture](https://rfd.shared.oxide.computer/rfd/0223) for a more detailed discussion. The endpoints live in [`nexus/src/external_api/console_api.rs`](https://github.com/oxidecomputer/omicron/blob/e4a585350b658879af88d769cde7ebe6d6960bf5/nexus/src/external_api/console_api.rs) in Omicron.

## Tech

- [TypeScript](https://www.typescriptlang.org/) + [React](https://reactjs.org/) (+ [React Router](https://reactrouter.com/), [React Query](https://tanstack.com/query/latest/), [React Table](https://tanstack.com/table/v8/))
- [Vite](https://vitejs.dev/) for dev server and browser bundling
- [Tailwind](https://tailwindcss.com/) for styling
- [oxide.ts](https://github.com/oxidecomputer/oxide.ts) generates an API client from [Nexus's OpenAPI spec](https://github.com/oxidecomputer/omicron/blob/main/openapi/nexus.json)
- Testing
  - [Mock Service Workers](https://mswjs.io/) for mock API server
  - [Vitest](https://vitest.dev/) for unit tests
  - [Playwright](https://playwright.dev/) for E2E browser tests
- [Ladle](https://ladle.dev/), a lightweight Storybook clone based on Vite (see main branch Storybook [here](https://console-ui-storybook.vercel.app/))

## Directory structure

The app is in [`app`](app). You can see the route structure in [`app/routes.tsx`](app/routes.tsx). In [`libs`](libs) we have a [`ui`](libs/ui) dir where the low-level components live (and the Storybook definition) and an [`api`](libs/api) dir where we keep the generated API client and a React Query wrapper for it. These directories are aliased in [`tsconfig.json`](tsconfig.json) for easy import from the main app as `@oxide/ui` and `@oxide/api`, respectively.

## Try it locally

The fastest way to see the console in action is to check out the repo, run `npm install && npm run start:msw`, and go to http://localhost:4000 in the browser. This runs the console with a mock API server that runs in a [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).

## Development

### Install dependencies

```
npm install
```

### Run Vite dev server + [MSW](https://mswjs.io/) mock API

This is the way we do nearly all console development. Just run:

```
npm run start:msw
```

and navigate to http://localhost:4000 in the browser. The running app will automatically update when you write a source file. This mode uses Mock Service Workers to run a mock API right the browser. This mock API is also used in tests.

### Run Vite dev server against real Nexus API

You can also run the console dev server locally with the mock server off, instead passing requests through to `localhost:12220`. Run `npm run start` (note no `:msw`) and navigate to http://localhost:4000/ in the browser. It will mostly not work unless Nexus is running at `localhost:12220`, which is the default for `omicron-dev` (see [Running Omicron (Simulated)](https://github.com/oxidecomputer/omicron/blob/main/docs/how-to-run-simulated.adoc) for how to set that up).

One way to run everything is to use the `tools/start_api.sh` script, which uses tmux to run multiple processes in different panes and automatically populates some fake data (see [`tools/populate_omicron_data.sh`](tools/populate_omicron_data.sh) to see exactly what). From the omicron directory, run `tools/start_api.sh`. Since we're assuming `console` and `omicron` are next to each other, that looks like this:

```sh
../console/tools/start_api.sh
```

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

### Run [Ladle](https://ladle.dev/)

```
npm run storybook
```

This will start a preview environment for the UI components in the project. The window should open automatically, but if not go to `http://localhost:61000`.

### E2E tests with [Playwright](https://playwright.dev/)

Playwright tests match the filename pattern `.e2e.ts`. The basic command to run all tests is `npm run e2e`. You may have to run `npx playwright install` after `npm install` to get the browser binaries.

There are two types of tests in our project. Validation tests which rely on mocked responses from MSW and smoke tests which assume a clean environment. Smoke tests are design to be ran against a rack meaning they create any required resources for the test and clean up after themselves.

Tests are ran across `chrome`, `firefox`, and `safari` when running `npm run e2e`. Test runs can be isolated to a single browser by setting a `BROWSER` environment variable like `BROWSER=chrome npm run e2e`. Tests can be further isolated down to either smoke or validation suites by providing a `--project` argument. For example, `npm run e2e -- --project=validate-chrome` or `npm run e2e -- --project=smoke-firefox`.

Some debugging tricks (see the docs [here](https://playwright.dev/docs/debug) for more details):

- Add `await page.pause()` to a test and run `BROWSER=chrome npm run e2e <test file> -- --headed` to run a test in a single headed browser with the excellent [Inspector](https://playwright.dev/docs/inspector) open and pause at that line. This is perfect for making sure the screen looks like you expect at that moment and testing selectors to use in the next step.

To debug end-to-end failures on CI checkout the branch with the failure and run `./tools/debug-ci-e2e-fail.sh`. It'll download the latest failures from CI and allow you to open a [playwright trace](https://playwright.dev/docs/trace-viewer-intro#viewing-the-trace) of the failure.

### Other useful commands

| Command                  | Description                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `npm test run`           | Vitest tests                                                                       |
| `npm test`               | Vitest tests in watch mode                                                         |
| `npm run e2ec`           | Only run end-to-end tests in chrome                                                |
| `npm run lint`           | ESLint                                                                             |
| `npx tsc`                | Check types                                                                        |
| `npm run ci`             | Lint, tests, and types                                                             |
| `npm run fmt`            | Format everything. Rarely necessary thanks to editor integration                   |
| `npm run gen-api`        | Generate API client (see [`docs/update-pinned-api.md`](docs/update-pinned-api.md)) |
| `npm run start:mock-api` | Serve mock API on port 12220                                                       |

## Relevant documents

### RFDs

- [RFD 4 User-Facing API](https://rfd.shared.oxide.computer/rfd/0004)
- [RFD 43 Identity and Access Management (IAM)](https://rfd.shared.oxide.computer/rfd/0043)
- [RFD 44 Hierarchy and API for User Management and Organizations](https://rfd.shared.oxide.computer/rfd/0044)
- [RFD 156 API Requirements for Console Prototype](https://rfd.shared.oxide.computer/rfd/0156)
- [RFD 169 Console Authentication and Session Management](https://rfd.shared.oxide.computer/rfd/0169)
- [RFD 180 Console v1 Scope](https://rfd.shared.oxide.computer/rfd/0180)
- [RFD 223 Web Console Architecture](https://rfd.shared.oxide.computer/rfd/0223)

### Figma

- [Component Library](https://www.figma.com/file/D5ukCJbedrlGkUIh0E6QtX/Component-Library)
- [Applied UI Exploration](https://www.figma.com/file/UDMGwny0LIyMUI9d35XVGl/Applied-UI-Exploration)
