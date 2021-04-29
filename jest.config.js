const { writeFileSync } = require('fs')
const { compilerOptions } = require('./tsconfig')

const mapObj = (obj, kf, vf) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [kf(k), vf(v)]))

const libs = mapObj(
  compilerOptions.paths,
  // need full matches, otherwise @oxide/api matches @oxide/api-mocks
  (moduleName) => `^${moduleName}$`,
  (paths) => `<rootDir>/${paths[0]}`
)

writeFileSync('test.json', JSON.stringify(libs, null, 2))

module.exports = {
  moduleNameMapper: {
    '\\.(svg)$': '<rootDir>/__mocks__/svgMock.tsx',
    '\\.(css|less)$': 'identity-obj-proxy',
    ...libs,
  },
}
