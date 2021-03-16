module.exports = {
  displayName: 'ui',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      { cwd: __dirname, configFile: './babel-jest.config.json' },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/ui',
  "moduleNameMapper": {
    "\\.(css|less)$": "identity-obj-proxy",
    "^@oxide/theme$": "<rootDir>/../theme/src",
  }
}
