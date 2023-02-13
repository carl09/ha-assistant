const Dotenv = require('dotenv-webpack');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

console.log('production', isProduction);

const plugins = [];

if (!isProduction) {
  plugins.push(new Dotenv());
}

/** @type { import('webpack').Configuration } */
const config = {
  entry: './src/index.ts',
  mode: isProduction ? 'production' : 'development',
  target: 'node',
  output: {
    path: path.join(__dirname, 'dist'), //  '/dist',
    filename: 'index.js',
  },
  devtool: 'source-map',
  resolve: {
    mainFields: ['es2015', 'module', 'main'],
    extensions: ['.ts', '.js'],
  },
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
  plugins: plugins,
};

module.exports = config;
