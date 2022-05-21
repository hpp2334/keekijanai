/* eslint-disable */
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const path = require("path");
const webpack = require("webpack");
const webpackCommonConfig = require("./webpack.config.common");

webpackCommonConfig.mode = "development";
webpackCommonConfig.devtool = "eval-source-map";
webpackCommonConfig.resolve.alias = {
  "@keekijanai/react": path.resolve(__dirname, "../keekijanai-react/src/index.ts"),
  "@keekijanai/frontend-core/libs/i18n": path.resolve(
    __dirname,
    "../keekijanai-frontend-core/src/libs/keekijanai-i18n/index.ts"
  ),
  "@keekijanai/frontend-core": path.resolve(__dirname, "../keekijanai-frontend-core/src/index.ts"),
};
webpackCommonConfig.plugins.push(
  new ReactRefreshWebpackPlugin(),
  // handle "@/" path in other packages
  new webpack.NormalModuleReplacementPlugin(/@\//, function (resource) {
    const workspaceRoot = path.resolve(__dirname, "../");
    const context = path.relative(workspaceRoot, resource.context);
    const pkgDirName = context.split("/")[0];
    if (resource.request && resource.request.startsWith("@/")) {
      resource.request = resource.request.replace("@/", () => path.join(workspaceRoot, pkgDirName, "src") + "/");
    }
  })
);

module.exports = webpackCommonConfig;
