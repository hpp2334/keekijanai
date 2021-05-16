const ssrCommonConf = require('./webpack.ssr.common.config');
const prodConf = require('./webpack.prod.config');

module.exports = {
  ...ssrCommonConf,
  ...prodConf,
  entry: ssrCommonConf.entry,
  output: ssrCommonConf.output,
}
