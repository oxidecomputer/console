/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  // Required to resolve sibling directories properly
  webpackFinal: (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@oxide/theme': path.resolve(__dirname, '../../theme/dist'),
      },
    },
  }),
}
