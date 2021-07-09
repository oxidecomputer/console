const tsBaseConfig = require('../../../tsconfig.json')

module.exports = {
  core: {
    builder: 'webpack5',
  },
  stories: [
    '../lib/**/__stories__/*.stories.mdx',
    '../lib/**/!(__stories__/)*.stories.@(ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    {
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          implementation: require('postcss'),
        },
      },
    },
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
}
