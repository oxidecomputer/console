const { compilerOptions } = require('./tsconfig')

const mapObj = (obj, kf, vf) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [kf(k), vf(v)]))

// Jest has its own janky module mapping syntax.
// need ^ and $, otherwise @oxide/api matches @oxide/api-mocks
// replace is there to turn
//   "app/*" => "app/*"
// into
//   "app/(.*)" => "<rootDir>/app/$1"
const libs = mapObj(
  compilerOptions.paths,
  (moduleName) => `^${moduleName.replace('*', '(.*)')}$`,
  (paths) => `<rootDir>/${paths[0].replace('*', '$1')}`
)

module.exports = {
  moduleNameMapper: {
    '\\.(svg)$': '<rootDir>/jest/mocks/svgMock.tsx',
    '\\.(css|less)$': 'identity-obj-proxy',
    ...libs,
  },
  setupFilesAfterEnv: ['<rootDir>/jest/setup.ts'],
  clearMocks: true,
}
