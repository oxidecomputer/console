import path from 'path'
import sharedConfig from './webpack.shared.config'

const config = {
  ...sharedConfig,
  mode: 'development',
  devtool: 'eval-source-map',
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
