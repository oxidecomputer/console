const fs = require('fs')
const path = require('path')
const tsBaseConfig = require('../../../tsconfig.json')

const findStoryPaths = (
  dir = path.join(__dirname, '../lib'),
  knownStoryPaths = []
) => {
  let files = fs.readdirSync(dir)

  files.forEach((file) => {
    let newDir = path.resolve(dir, file)
    let storyPath = path.dirname(
      path.relative(__dirname, path.resolve(dir, file))
    )

    if (fs.statSync(newDir).isDirectory()) {
      // eslint-disable-next-line no-param-reassign
      knownStoryPaths = findStoryPaths(newDir, knownStoryPaths)
    } else if (
      file.match(/.+\.stories\.(tsx|ts|mdx)$/) &&
      !knownStoryPaths.includes(storyPath)
    ) {
      knownStoryPaths.push(storyPath)
    }
  })

  return knownStoryPaths
}

module.exports = {
  features: {
    previewCsfV3: true,
  },
  core: {
    builder: 'storybook-builder-vite',
  },
  // stories: findStoryPaths().map((storyPath) => ({
  //   directory: storyPath,
  //   files: '*.stories.@(tsx|ts|mdx)',
  //   titlePrefix: 'components',
  // })),
  stories: [
    '../lib/**/__stories__/*.stories.mdx',
    '../lib/**/*.stories.@(ts|tsx|mdx)',
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
  async viteFinal(config) {
    // customize the Vite config here
    Object.entries(tsBaseConfig.compilerOptions.paths)
      .map(([alias, pathArr]) => [
        alias,
        path.resolve(__dirname, '..', '..', '..', pathArr[0]),
      ])
      .forEach(([alias, pathStr]) => {
        console.log(pathStr)
        config.resolve.alias[alias] = pathStr
      })
    console.log(config.resolve.alias)
    return config
  },
}
