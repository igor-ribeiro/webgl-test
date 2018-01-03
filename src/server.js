const express = require('express');
const webpack = require('webpack');
const devMiddleware = require('webpack-dev-middleware');
const path = require('path');
const bodyParser = require('body-parser');
const { readFile, writeFile, readdirSync } = require('fs');
const { promisify } = require('util');

const webpackOptions = require('./../webpack.config');

const app = express();
const compiler = webpack(webpackOptions);
const middleware = devMiddleware(compiler, {
  publicPath: webpackOptions.output.publicPath,
  serverSideRender: true,
  stats: false,
});

app.use(middleware);

app.listen('8888', () => console.log('Listening on http://localhost:8888'));