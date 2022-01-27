/* eslint-disable */
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].js",
  },
  devtool: "eval-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "typescript",
                tsx: true,
                decorators: true,
                dynamicImport: true,
              },
              target: "es2020",
              transform: {
                legacyDecorator: true,
                decoratorMetadata: true,
                react: {
                  runtime: "automatic",
                  development: true,
                  refresh: true,
                },
              },
            },
            sourceMaps: true,
          },
        },
      },
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    alias: {
      "@keekijanai/react": path.resolve(__dirname, "../keekijanai-react/src/index.ts"),
      "@keekijanai/frontend-core": path.resolve(__dirname, "../keekijanai-frontend-core/src/index.ts"),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./public/template.html"),
      publicPath: "/",
    }),
    new ReactRefreshWebpackPlugin(),
    // handle "@/" path in other packages
    new webpack.NormalModuleReplacementPlugin(/@\//, function (resource) {
      const workspaceRoot = path.resolve(__dirname, "../");
      const context = path.relative(workspaceRoot, resource.context);
      const pkgDirName = context.split("/")[0];
      if (resource.request && resource.request.startsWith("@/")) {
        resource.request = resource.request.replace("@/", () => path.join(workspaceRoot, pkgDirName, "src") + "/");
      }
    }),
    process.env.NODE_ENV === "BUILD" && new BundleAnalyzerPlugin(),
  ].filter(Boolean),
  devServer: {
    hot: true,
    historyApiFallback: true,
    proxy: {
      "/keekijanai": "http://127.0.0.1:3000",
    },
  },
};
