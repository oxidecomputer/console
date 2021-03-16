module.exports = {
  displayName: 'web-console',
  preset: '../../jest.preset.js',
  transform: {
    // '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      { cwd: __dirname, configFile: './babel-jest.config.json' },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/web-console',
  "moduleNameMapper": {
    "\\.(css|less)$": "identity-obj-proxy",
    "^@oxide/ui$": "<rootDir>/../../libs/ui/src",
    "^@oxide/theme$": "<rootDir>/../../libs/theme/src",
  }
}
