const rootMain = require('../../../.storybook/main')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

// Use the following syntax to add addons!
rootMain.addons.push('@storybook/addon-links')
rootMain.stories.push(
  ...[
    '../src/lib/**/__stories__/*.stories.mdx',
    '../src/lib/**/!(__stories__/)*.stories.@(ts|tsx)',
  ]
)
rootMain.managerWebpack = async (baseConfig) => {
  const tsPaths = new TsconfigPathsPlugin({
    configFile: './tsconfig.json',
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
