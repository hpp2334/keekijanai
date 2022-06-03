/* eslint-disable */
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpackCommonConfig = require("./webpack.config.common");

webpackCommonConfig.mode = "production";
webpackCommonConfig.devtool = "source-map";
webpackCommonConfig.plugins.push(new BundleAnalyzerPlugin());
webpackCommonConfig.plugins.push(new CleanWebpackPlugin());

// split chunks to better analyze
webpackCommonConfig.optimization = {
  splitChunks: {
    chunks: "initial",
    cacheGroups: {
      reactIcons: {
        name: "react-icons",
        test: /[\\/]node_modules\/react-icons[\\/]/,
        priority: -5,
        reuseExistingChunk: true,
      },
      react: {
        name: "react",
        test: /[\\/]node_modules\/react(-dom)?[\\/]/,
        priority: -5,
        reuseExistingChunk: true,
      },
    },
  },
};
module.exports = webpackCommonConfig;
