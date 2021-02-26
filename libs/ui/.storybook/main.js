const rootMain = require('../../../.storybook/main')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

// Use the following syntax to add addons!
rootMain.addons.push('@storybook/addon-links')
rootMain.stories.push(
  ...['../src/lib/**/*.stories.mdx', '../src/lib/**/*.stories.@(js|jsx|ts|tsx)']
)
rootMain.managerWebpack = async (baseConfig, options) => {
  const tsPaths = new TsconfigPathsPlugin({
    configFile: './tsconfig.base.json',
  })

  return {
    ...baseConfig,
    resolve: {
      ...baseConfig.resolve,
      plugins: [...baseConfig.resolve.plugins, tsPaths],
    },
  }
}

module.exports = rootMain
