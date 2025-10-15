# Testing code

- `npm run tsc`
- `npm test run`
- `npm run e2ec` runs playwright tests in chrome only. add args to filter by filename and test name
  - `npm run e2ec -- system-update`
  - `npm run e2ec -- instance -g 'boot disk'`

# Upgrading pinned omicron version

1. Update commit hash in OMICRON_VERSION
2. run `npm run gen-api`
3. run `npm run tsc`
4. fix type errors. new endpoints in msw handlers.ts should be added as NotImplemented

# Implementing mock API endpoints

- Only implement what is necessary to exercise the UI
- Store API reponse objects in the mock tables when possible
