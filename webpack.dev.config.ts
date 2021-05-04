import path from 'path'
import webpack from 'webpack'
import sharedConfig from './webpack.shared.config'

const config = {
  ...sharedConfig,
  mode: 'development',
  output: {
    publicPath: '/',
  },
  plugins: [...sharedConfig.plugins, new webpack.HotModuleReplacementPlugin()],
  devtool: 'inline-source-map',
  target: 'web',
  devServer: {
    contentBase: path.join(__dirname, 'dist/apps/web-console'),
    historyApiFallback: true,
    port: 4000,
    hot: true,
    proxy: {
      '/api': {
        target: 'http://localhost:12220',
        pathRewrite: { '^/api': '' },
      },
    },
  },
}

export default config
