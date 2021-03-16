import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

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
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.(ts|js)x?$/i,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
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
        oneOf: [
          // If coming from JS/TS file, then transform into React component using SVGR.
          {
            test: /\.[jt]sx?$/,
            use: [
              {
                loader: require.resolve('@svgr/webpack'),
                options: {
                  svgo: false,
                  titleProp: true,
                  ref: true,
                },
              },
              {
                loader: require.resolve('url-loader'),
                options: {
                  limit: 10000, // 10kB
                  name: '[name].[hash:7].[ext]',
                  esModule: false,
                },
              },
            ],
          },
          // Fallback to plain URL loader.
          {
            use: [
              {
                loader: require.resolve('url-loader'),
                options: {
                  limit: 10000, // 10kB
                  name: '[name].[hash:7].[ext]',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@oxide/theme': path.resolve(__dirname, 'libs/theme/src/'),
      '@oxide/ui': path.resolve(__dirname, 'libs/ui/src/'),
      '@oxide/backend-types': path.resolve(
        __dirname,
        'libs/backend-types/src/'
      ),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'apps/web-console/src/index.html',
    }),
  ],
}
