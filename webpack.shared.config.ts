import HtmlWebpackPlugin from 'html-webpack-plugin'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'

export default {
  entry: './apps/web-console/src/main.tsx',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(ttf|otf)$/i,
        use: ['file-loader'],
      },
      {
        test: /\.(ts|js)x?$/i,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
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
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: './tsconfig.json',
      }),
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'apps/web-console/src/index.html',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'apps/web-console/static' },
        {
          from: 'libs/api/__generated__/nexus-openapi.json',
          to: 'docs/nexus-openapi.json',
        },
      ],
      // HACK: bug introduced in webpack 5.37, not sure what's going on but most
      // likely there's a problem with the types on this plugin. other plugins
      // are fine
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any,
  ],
}
