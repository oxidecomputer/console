# Console

Web client to the Oxide rack API.

Tech: [TypeScript](https://www.typescriptlang.org/), [React](https://reactjs.org/) (+ [React Router](https://reactrouter.com/), [React Query](https://react-query.tanstack.com), [React Table](https://react-table.tanstack.com)), [Webpack](https://webpack.js.org/), [Babel](https://babeljs.io/), [Tailwind](https://tailwindcss.com/). We use a TypeScript API wrapper [generated](tools/generate_api_client.sh) from the Nexus OpenAPI schema with [openapi-generator](https://openapi-generator.tech/).

## Relevant documents

### RFDs

- [RFD 4 User-Facing API](https://rfd.shared.oxide.computer/rfd/0004)
- [RFD 43 Identity and Access Management (IAM)](https://rfd.shared.oxide.computer/rfd/0043)
- [RFD 44 Hierarchy and API for User Management and Organizations](https://rfd.shared.oxide.computer/rfd/0044)
- [RFD 155 Console Route Tree](https://rfd.shared.oxide.computer/rfd/0155)
- [RFD 156 API Requirements for Console Prototype](https://rfd.shared.oxide.computer/rfd/0156)
- [RFD 169 Console Authentication and Session Management](https://rfd.shared.oxide.computer/rfd/0169)
- [RFD 180 Console v1 Scope](https://rfd.shared.oxide.computer/rfd/0180)

### Figma

- [Component Library](https://www.figma.com/file/D5ukCJbedrlGkUIh0E6QtX/Component-Library)
- [Applied UI Exploration](https://www.figma.com/file/UDMGwny0LIyMUI9d35XVGl/Applied-UI-Exploration)
- [Console Prototype v2 (old)](https://www.figma.com/file/Z4cn380qKc7cqT91YNrbgn/Console-Prototype-v2)
- [Oxide Design System (old)](https://www.figma.com/file/EUf6YnFJx0AKE8GGYDAoRO/Oxide-Design-System)

## Try it out

The console is deployed to GCP with its own copy of Nexus for testing purposes. The underlying systems are simulated, so while you can create "instances" (CockroachDB rows representing instances), they are not actually instantiated as running VMs. [Set up Tailscale](https://github.com/oxidecomputer/meta/blob/master/general/vpn.md) and go to https://console-git-main.internal.oxide.computer to see the main branch. PRs are also deployed to `console-git-<branch_name>.internal.oxide.computer`.

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

### Run dev server

Run `yarn start` and navigate to http://localhost:4000/. The app will automatically reload if you change code.

### Run API

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

### Other useful commands

| Command     | Description                                                      |
| ----------- | ---------------------------------------------------------------- |
| `yarn test` | Jest tests. Takes Jest flags like `--onlyChanged` or `--watch`   |
| `yarn lint` | ESLint                                                           |
| `yarn tsc`  | Check types                                                      |
| `yarn ci`   | Lint, tests, and types                                           |
| `yarn fmt`  | Format everything. Rarely necessary thanks to editor integration |
