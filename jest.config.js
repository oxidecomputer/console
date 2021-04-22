const { compilerOptions } = require('./tsconfig')

const mapValues = (obj, f) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, f(v)]))

const libPaths = mapValues(compilerOptions.paths, (paths) => {
  const dir = paths[0].replace('/index.ts', '')
  return `<rootDir>/../../${dir}`
})

const moduleNameMapper = {
  '\\.(svg)$': '<rootDir>/../../__mocks__/svgMock.tsx',
  '\\.(css|less)$': 'identity-obj-proxy',
  ...libPaths,
}

module.exports = {
  projects: [
    {
      displayName: 'web-console',
      rootDir: '<rootDir>/apps/web-console',
      moduleNameMapper,
    },
    {
      displayName: 'ui',
      rootDir: '<rootDir>/libs/ui',
      moduleNameMapper,
    },
    {
      displayName: 'theme',
      rootDir: '<rootDir>/libs/theme',
      moduleNameMapper,
    },
    {
      displayName: 'api',
      rootDir: '<rootDir>/libs/api',
      moduleNameMapper,
    },
  ],
}
