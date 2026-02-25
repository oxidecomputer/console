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
      "AGENTS.md",
      "app/api/__tests__/client.spec.tsx",
      "mock-api/msw/db.ts",
      "test/e2e/instance-create.e2e.ts",
      "test/e2e/inventory.e2e.ts",
      "test/e2e/ip-pool-silo-config.e2e.ts",
      "test/e2e/profile.e2e.ts",
      "test/e2e/project-access.e2e.ts",
      "test/e2e/silo-access.e2e.ts",
      "tsconfig.json",
    ]
  `)
  expect(grepFiles('mock-api')).toMatchInlineSnapshot(`
    [
      "AGENTS.md",
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
it('e2e tests are only in test/e2e or test/visual', () => {
  for (const file of listFiles('\\.e2e\\.')) {
    expect(file).toMatch(/^test\/(e2e|visual)/)
  }
})

// 8-4-4-4-12 hex digits
const UUID_RE = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

// RFC 4122: version nibble (3rd group, 1st char) is 1-5,
// variant nibble (4th group, 1st char) is 8, 9, a, or b
const VALID_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

it('all UUIDs in mock-api files are valid RFC 4122', () => {
  const output = execSync(`git grep -n -oP '${UUID_RE}' -- 'mock-api/'`).toString().trim()
  const invalid = output.split('\n').filter((line) => {
    const uuid = line.split(':').slice(2).join(':')
    return !VALID_UUID_RE.test(uuid)
  })
  expect(
    invalid,
    `Invalid UUIDs found:\n${invalid.join('\n')}\n\nUse a reliable generator (e.g., uuidgen) to create valid v4 UUIDs.`
  ).toEqual([])
})
