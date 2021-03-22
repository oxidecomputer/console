const tsBaseConfig = require('../../../tsconfig.json')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

module.exports = {
  stories: [
    '../src/lib/**/__stories__/*.stories.mdx',
    '../src/lib/**/!(__stories__/)*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    'storybook-dark-mode',
  ],
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldExtractValuesFromUnion: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
      compilerOptions: {
        allowSyntheticDefaultImports: false,
        esModuleInterop: false,
        paths: tsBaseConfig.compilerOptions.paths,
      },
    },
  },
  managerWebpack: async (config) => {
    const tsPaths = new TsconfigPathsPlugin({
      configFile: './tsconfig.json',
    })
    config.resolve.plugins.push(tsPaths)
    return config
  },
}
