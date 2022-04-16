import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

it('Generated API client version matches API version specified for deployment', () => {
  const generatedVersion = fs
    .readFileSync(path.resolve(__dirname, '../__generated__/OMICRON_VERSION'), 'utf8')
    .split('\n')[1]

  const packerConfig = fs.readFileSync(
    path.resolve(__dirname, '../../../.github/workflows/packer.yaml'),
    'utf8'
  )
  const deployedVersion = /API_VERSION: ([0-9a-f]+)/.exec(packerConfig)?.[1]

  // if this test fails, most likely you have updated the API_VERSION in packer.yaml
  // without re-running `yarn gen-api`
  expect(generatedVersion).toEqual(deployedVersion)
})

const grepFiles = (s: string) =>
  execSync(`git grep -l "${s}"`)
    .toString()
    .trim()
    .split('\n')
    .filter((f) => !/safety\.spec\.ts/.test(f)) // this file doesn't count

it('@oxide/api-mocks is only referenced in test files', () => {
  const files = grepFiles("from '@oxide/api-mocks'")
  for (const file of files) {
    expect(file).toMatch(/__tests__\/|app\/test\/|\.spec\.|tsconfig|api-mocks/)
  }
})

// findByRole is too slow: the getByRole query is usually longer than the
// default waitFor interval of 50ms. Try findByText or findByTestId instead
it("don't use findByRole", () => {
  const files = grepFiles('screen.findByRole')
  expect(files).toEqual([])
})
