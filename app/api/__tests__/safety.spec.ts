/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { expect, it } from 'vitest'

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

it('mock-api is only referenced in test files', () => {
  expect(grepFiles('api-mocks')).toMatchInlineSnapshot(`
    [
      "app/api/__tests__/hooks.spec.tsx",
      "mock-api/msw/db.ts",
      "test/e2e/instance-create.e2e.ts",
      "test/e2e/inventory.e2e.ts",
      "test/e2e/profile.e2e.ts",
      "test/e2e/project-access.e2e.ts",
      "test/e2e/silo-access.e2e.ts",
      "tsconfig.json",
    ]
  `)
  expect(grepFiles('mock-api')).toMatchInlineSnapshot(`
    [
      "README.md",
      "app/main.tsx",
      "app/msw-mock-api.ts",
      "docs/mock-api-differences.md",
      "package.json",
      "test/e2e/utils.ts",
      "test/unit/server.ts",
      "test/unit/setup.ts",
      "tools/start_mock_api.ts",
      "tsconfig.json",
    ]
  `)
})

// findByRole is too slow: the getByRole query is usually longer than the
// default waitFor interval of 50ms. Try findByText or findByTestId instead
it("don't use findByRole", () => {
  const files = grepFiles('screen.findByRole')
  expect(files).toEqual([])
})

const listFiles = (s: string) =>
  execSync(`git ls-files | grep "${s}"`).toString().trim().split('\n')

// avoid accidentally making an e2e file in the wrong place
it('e2e tests are only in test/e2e', () => {
  for (const file of listFiles('\\.e2e\\.')) {
    expect(file).toMatch(/^test\/e2e/)
  }
})
