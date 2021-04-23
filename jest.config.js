const { compilerOptions } = require('./tsconfig')

const mapValues = (obj, f) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, f(v)]))

const libs = mapValues(compilerOptions.paths, ([path]) => `<rootDir>/${path}`)

module.exports = {
  moduleNameMapper: {
    '\\.(svg)$': '<rootDir>/__mocks__/svgMock.tsx',
    '\\.(css|less)$': 'identity-obj-proxy',
    ...libs,
  },
  testPathIgnorePatterns: ['/node_modules/', 'apps/web-console-e2e'],
}
