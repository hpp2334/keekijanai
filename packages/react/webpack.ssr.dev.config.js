const ssrCommonConf = require('./webpack.ssr.common.config');
const devConf = require('./webpack.dev.config');

module.exports = {
  ...ssrCommonConf,
  ...devConf,
  entry: ssrCommonConf.entry,
  output: ssrCommonConf.output,
  
}
