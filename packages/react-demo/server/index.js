const path = require('path');
const express = require('express');
const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');
const { handler } = require('./keekijanai-adapter.js');
const webpackConfig = require('../webpack.config');

async function createServer() {
  const app = express();
  const compiler = webpack(webpackConfig);

  app.use(
    middleware(compiler),
  );

  app.use('/api/blog-common', async (req, res) => {
    await handler(req, res);
  });

  app.listen(3000);

  console.log('listen at http://localhost:3000');
}

createServer()
