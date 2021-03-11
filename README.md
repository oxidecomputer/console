# Oxide - Console

This project was generated using [Nx](https://nx.dev).

## Getting started

### Dependencies

This project uses `yarn`, not `npm`, so install Node dependencies with

```
yarn install
```

For commands that begin with `nx` in the instructions below, you can either 

- install `nx` globally with `yarn add global nx` or `npm i -g nx`, or
- use `yarn nx <command>` to use the copy local to this directory

### Run Storybook

```
yarn storybook
```

This will start the storybook for the `ui` component library and start it on `http://localhost:4400`.

### Run dev server

Run `nx serve web-console` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

### Create a new component

Generate a React component, a test file, and a Storybook story with

```
yarn plop ui-component
```

It will prompt for a component name and a subdirectory of `libs/ui/src/lib` for the component to go in (default is root, i.e., `libs/ui/src/lib`).

### Run unit tests

Run `nx test <app_name>` to execute the unit tests via [Jest](https://jestjs.io). For example, `nx test ui` would run the tests for the component library in `libs/ui`.

Run `nx affected:test` to execute the unit tests affected by a change.

### Run end-to-end tests

Run `nx e2e <app_name>` to execute the end-to-end tests via [Cypress](https://www.cypress.io).

Run `nx affected:e2e` to execute the end-to-end tests affected by a change.

## Less common tasks

### Generate an application

Run `nx g @nrwl/react:app <app_name>` to generate an application.

When using Nx, you can create multiple applications and libraries in the same workspace.

### Generate a library

Run `nx g @nrwl/react:lib my-lib` to generate a library.

Libraries are shareable across libraries and applications. They can be imported from `@oxide/mylib`.

### Build

Run `nx build <app_name>` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Show dependency graph

Run `nx dep-graph` to see a diagram of the dependencies of your projects.