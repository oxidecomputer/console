import fs from 'fs'
import path from 'path'

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
