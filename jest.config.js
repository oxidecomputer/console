const moduleNameMapper = {
  '\\.(svg)$': '<rootDir>/../../__mocks__/svgMock.tsx',
  '\\.(css|less)$': 'identity-obj-proxy',
  '^@oxide/ui$': '<rootDir>/../../libs/ui/src',
  '^@oxide/theme$': '<rootDir>/../../libs/theme/src',
  '^@oxide/api$': '<rootDir>/../../libs/api',
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
