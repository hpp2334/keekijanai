const { merge } = require('webpack-merge');
const commonConf = require('./webpack.common.config');
const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = {
  ...commonConf,
  target: "node",
  entry: ['./test/ssr/index.tsx'],
  output: {
    ...commonConf.output,
    path: path.join(__dirname, './test/ssr/dist'),
    filename: "index.js"
  },
  externals: [nodeExternals()],
}
