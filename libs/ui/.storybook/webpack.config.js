const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
/**
 * Export a function. Accept the base config as the only param.
 *
 * @param {Parameters<typeof rootWebpackConfig>[0]} options
 */
module.exports = async ({ config }) => {
  const tsPaths = new TsconfigPathsPlugin({
    configFile: './tsconfig.json',
  })

  config.resolve.plugins = [tsPaths]

  // Found this here: https://github.com/nrwl/nx/issues/2859
  // And copied the part of the solution that made it work

  const svgRuleIndex = config.module.rules.findIndex((rule) => {
    const { test } = rule

    return test.toString().startsWith('/\\.(svg|ico')
  })
  config.module.rules[
    svgRuleIndex
  ].test = /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/

  config.module.rules.push(
    {
      test: /\.(png|jpe?g|gif|webp)$/,
      loader: require.resolve('url-loader'),
      options: {
        limit: 10000, // 10kB
        name: '[name].[hash:7].[ext]',
      },
    },
    {
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            titleProp: true,
            svgo: false,
          },
        },
      ],
    }
  )

  return config
}
