import path from 'path'
import webpack from 'webpack'
import { merge } from 'webpack-merge'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import sharedConfig from './webpack.shared.config'

const config = merge<webpack.Configuration>(sharedConfig, {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    publicPath: '',
  },
  plugins: [new CleanWebpackPlugin()],
})

export default config
