const path = require('path');
const importFresh = require('import-fresh');
const express = require('express');
const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');
const { handler } = importFresh('./keekijanai-adapter.js');
const webpackConfig = require('../webpack.config');
const history = require('connect-history-api-fallback');
const cookieParser = require('cookie-parser')

async function createServer() {
  const app = express();
  const compiler = webpack(webpackConfig);

  app.use(cookieParser());
  app.use(express.json())

  app.use('/api/blog-common', async (req, res) => {
    await handler(req, res);
  });
  app.use(history());
  app.use(middleware(compiler));


  app.listen(3000);

  console.log('listen at http://localhost:3000');
}

createServer()
