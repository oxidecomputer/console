import path from 'path'
import webpack from 'webpack'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import sharedConfig from './webpack.shared.config'

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
