const path = require('path');

module.exports = {
  entry: {
    app: ['./app.js'],
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'app.js',
  },
  devServer: {
    inline: true,
    contentBase: './public',
  },
};