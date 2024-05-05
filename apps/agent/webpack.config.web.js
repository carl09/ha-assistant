const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { version } = require('./package.json');

module.exports = {
  // mode: 'production',
  mode: 'development',
  target: 'web',
  // devtool: undefined,
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist/'),
    filename: 'web-bundle.js',
  },
  // experiments: {
  //   outputModule: true,
  // },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new HtmlWebpackPlugin({
      filename: 'debug.html',
      template: './src/debug.html',
      inject: 'body',
      title: `HA Local Home Agent v${version}`,
      scriptLoading: 'blocking'
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: { node: 16 },
              },
            ],
            ['@babel/preset-typescript', {}],
          ],
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      buffer: require.resolve('buffer'),
      stream: require.resolve('stream-browserify'),
    },
  },
};
