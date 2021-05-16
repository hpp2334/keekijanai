const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common.config');
const { ProvidePlugin } = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  ...commonConfig,
  resolve: {
    ...commonConfig.resolve,
    plugins: [new TsconfigPathsPlugin({
      configFile: 'tsconfig.json'
    })]
  },
  plugins: [
    new ProvidePlugin({
			React: 'react',
		}),
    ...commonConfig.plugins,
  ]
}
