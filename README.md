# Oxide - Console

## Install dependencies

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

Clone https://github.com/oxidecomputer/omicron in the same parent directory as `console` and install [rustup](https://rustup.rs/). Then:

```
rustup install stable  # install Rust
cargo build  # needs to be run in the omicron directory
npm i -g json
brew install tmux
```

The easy way to run everything is to use the `tools/run_api.sh` script, which uses tmux to run three processes in three different panes and automatically populates some fake data (see `tools/populate_omicron_data.sh` to see exactly what). From the omicron directory, run `tools/run_api.sh`. Since we're assuming `console` and `omicron` are next to each other, that looks like this:

```sh
../console/tools/run_api.sh
```

To stop the API run `tools/stop_api.sh` (which kills the tmux session) or kill the tmux session manually.

<details>
<summary>Running without tmux</summary>

If you don't want to use tmux, make sure you've done the above setup and then run each of the following in its own terminal window (in order — the sled agent depends on nexus, and the populate script depends on the sled agent):

```
cargo run --bin=nexus -- examples/config.toml
cargo run --bin=sled_agent -- $(uuidgen) 127.0.0.1:12345 127.0.0.1:12221
../console/tools/populate_omicron_data.sh
```

</details>

### Create a new UI component

Generate a React component, a test file, and a Storybook story with

```
yarn plop ui-component
```

It will prompt for:

- component name
- a subdirectory of `libs/ui/src/lib` for the component to go in (default is root, i.e., `libs/ui/src/lib`), and
- whether to use [MDX](https://storybook.js.org/docs/react/api/mdx) story format or the default [CSF](https://storybook.js.org/docs/react/api/csf)

You can skip the prompts by including the answers directly in the command:

```
yarn plop ui-component RedButton buttons n
```

### Run unit tests

Run `yarn test` to execute the unit tests. Because this just calls [Jest](https://jestjs.io), you can use any flag Jest takes, like `yarn test --onlyChanged` or `yarn test --watch`.

### Build for production

Run `yarn build` to build the console app. The build artifacts will be stored in the `dist/` directory.
