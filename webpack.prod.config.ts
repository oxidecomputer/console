import path from 'path'
import webpack from 'webpack'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import sharedConfig from './webpack.shared.config'

if (!process.env.API_URL) {
  throw Error(
    'API_URL cannot be undefined. You are probably attempting to run `yarn build` without it.'
  )
}

const config = {
  ...sharedConfig,
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist/apps/web-console'),
    filename: '[name].[contenthash].js',
    publicPath: '',
  },
  plugins: [
    ...sharedConfig.plugins,
    new webpack.DefinePlugin({
      'process.env.API_URL': JSON.stringify(process.env.API_URL),
    }),
    new CleanWebpackPlugin(),
  ],
}

export default config
