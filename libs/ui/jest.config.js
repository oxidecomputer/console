module.exports = {
  displayName: 'ui',
  preset: '../../jest.preset.js',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/ui',
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
    '^@oxide/theme$': '<rootDir>/../theme/src',
  },
}
