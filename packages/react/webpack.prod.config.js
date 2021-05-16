const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common.config');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  ...commonConfig,
  // mode: 'production',
  resolve: {
    ...commonConfig.resolve,
    plugins: [new TsconfigPathsPlugin({
      configFile: 'tsconfig.prod.json'
    })]
  },
  plugins: [
    ...commonConfig.plugins,
  ]
}
