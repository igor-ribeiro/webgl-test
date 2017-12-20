const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './app.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'app.js',
  },
  devServer: {
    inline: true,
    contentBase: './public',
    // publicPath: './assets',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        }),
      },
    ],
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: './index.html',
    }),
    new ExtractTextPlugin('app.css'),
    new CopyWebpackPlugin(['./assets/**']),
  ],
};