const nxPreset = require('@nrwl/jest/preset')

module.exports = {
  ...nxPreset,
  moduleNameMapper: {
    '\\.(svg)$': '<rootDir>/../../__mocks__/svgMock.tsx',
  },
}
