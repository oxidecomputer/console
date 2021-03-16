module.exports = {
  displayName: 'web-console',
  preset: '../../jest.preset.js',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/web-console',
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
    '^@oxide/ui$': '<rootDir>/../../libs/ui/src',
    '^@oxide/theme$': '<rootDir>/../../libs/theme/src',
  },
}
