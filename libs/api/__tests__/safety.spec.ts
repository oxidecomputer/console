import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

describe('Generated API client version', () => {
  it('matches API version specified for deployment', () => {
    const generatedVersion = fs
      .readFileSync(
        path.resolve(__dirname, '../__generated__/OMICRON_VERSION'),
        'utf8'
      )
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
})

it('@oxide/api-mocks is only referenced in test files', () => {
  const stdOut = execSync('git grep -l "@oxide/api-mocks"')
  const files = stdOut.toString().trim().split('\n')
  for (const file of files) {
    expect(file).toMatch(/__tests__|\.spec\.|jest|tsconfig|api-mocks/)
  }
})
