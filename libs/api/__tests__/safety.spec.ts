import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

it('Generated API client version matches API version specified for deployment', () => {
  const generatedVersion = fs
    .readFileSync(path.resolve(__dirname, '../__generated__/OMICRON_VERSION'), 'utf8')
    .split('\n')[1]
    .trim()

  const pinnedVersion = fs
    .readFileSync(path.resolve(__dirname, '../../../OMICRON_VERSION'), 'utf8')
    .trim()

  // if this test fails, most likely you have updated the API_VERSION in
  // console/OMICRON_VERSION without re-running `npm run gen-api`
  expect(generatedVersion).toEqual(pinnedVersion)
})

const grepFiles = (s: string) =>
  execSync(`git grep -l "${s}"`)
    .toString()
    .trim()
    .split('\n')
    .filter((f) => !/safety\.spec\.ts/.test(f)) // this file doesn't count

it('@oxide/api-mocks is only referenced in test files', () => {
  const files = grepFiles("from '@oxide/api-mocks'")
  expect(files).toMatchInlineSnapshot(`
    [
      "app/pages/__tests__/instance-create.e2e.ts",
      "app/pages/__tests__/project-access.e2e.ts",
      "app/pages/__tests__/silo-access.e2e.ts",
      "app/test/unit/server.ts",
      "app/test/unit/setup.ts",
      "libs/api-mocks/msw/db.ts",
      "libs/api/__tests__/hooks.spec.tsx",
      "tools/start_mock_api.ts",
    ]
  `)
})

// findByRole is too slow: the getByRole query is usually longer than the
// default waitFor interval of 50ms. Try findByText or findByTestId instead
it("don't use findByRole", () => {
  const files = grepFiles('screen.findByRole')
  expect(files).toEqual([])
})
