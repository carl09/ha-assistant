const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: "./src/index.tsx",
  mode: "development",
  devServer: {
    static: "./dist",
    // contentBase: path.join(__dirname, 'dist'),
    port: 3001,
    open: true,
  },
  target: ["web", "es2017"],
  output: {
    module: true,
  },
  experiments: {
    outputModule: true,
  },
  devtool: "source-map",
  resolve: {
    mainFields: ["es2015", "module", "main"],
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".scss", ".css"],
    fallback: {
      crypto: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
      {
        test: /\.(t|j)sx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: [
            [
              "@babel/preset-env",
              {
                targets: { esmodules: true },
                modules: false,
                shippedProposals: true,
                bugfixes: true,
                useBuiltIns: false,
              },
            ],
            [
              "@babel/preset-react",
              {
                runtime: "automatic",
              },
            ],
            ["@babel/preset-typescript", {}],
          ],
        },
      },
      {
        test: /\.(css|scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
          "sass-loader",
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].bundle.css",
      chunkFilename: "[id].css",
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      scriptLoading: "module",
    }),
    new Dotenv()
  ],
};
