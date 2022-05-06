/* eslint-disable */
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const webpackCommonConfig = require("./webpack.config.common");

webpackCommonConfig.mode = "production";
webpackCommonConfig.plugins.push(new BundleAnalyzerPlugin());

module.exports = webpackCommonConfig;
