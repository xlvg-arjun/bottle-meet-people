const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const transpileOptions = require('../.babelrc.json');

module.exports = {
  entry: path.join(__dirname, '..', 'src', 'index.coffee'),
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, '..', 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.coffee$/,
        loader: 'coffee-loader',
        options: {
          // bare: false,
          // literate: true,
          transpile: transpileOptions,
        },
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                strictMath: true,
              },
            },
          },
        ],
      },
    ],
  },
  // watch: true,
  // watchOptions: {
  //   aggregateTimeout: 200,
  //   poll: 1000,
  // },
  devServer: {
    contentBase: path.join(__dirname, '..', 'dist'),
    compress: true,
    port: 9000,
    historyApiFallback: true,
  },
  plugins: [new HtmlWebpackPlugin({
    template: path.join(__dirname, '..', 'src', 'index.html'),
    inject: true,
  }), new CleanWebpackPlugin()]
};