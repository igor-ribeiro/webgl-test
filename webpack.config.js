const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './app.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'app.[hash:5].js',
  },
  devServer: {
    // inline: true,
    contentBase: './public',
    hot: true,
    // publicPath: './assets',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: './index.html',
    }),
    new ExtractTextPlugin('app.[hash:5].css'),
    new CopyWebpackPlugin(['./assets/**']),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
};