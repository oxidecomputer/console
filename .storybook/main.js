const tsBaseConfig = require('../tsconfig.json')
module.exports = {
  stories: [],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
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
