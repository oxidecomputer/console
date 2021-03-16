import path from 'path'
import webpack from 'webpack'
import { merge } from 'webpack-merge'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import sharedConfig from './webpack.shared.config'

const config = merge<webpack.Configuration>(sharedConfig, {
  mode: 'development',
  output: {
    publicPath: '/',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'apps/web-console/src/index.html',
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    historyApiFallback: true,
    port: 4000,
    hot: true,
  },
})

export default config
