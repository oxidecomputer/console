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
