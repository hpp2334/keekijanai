/* eslint-disable */
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isProd = process.env.NODE_ENV === "production";

const styleLoader = isProd ? MiniCssExtractPlugin.loader : "style-loader";

module.exports = {
  mode: "development",
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].js",
  },
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
                dynamicImport: true,
              },
              target: "es2020",
              transform: {
                react: {
                  runtime: "automatic",
                  development: !isProd,
                  refresh: !isProd,
                },
              },
            },
            sourceMaps: true,
          },
        },
      },
      {
        test: /\.css$/i,
        use: [styleLoader, "css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        exclude: /\.module\.s[ac]ss$/i,
        use: [styleLoader, "css-loader", "sass-loader"],
      },
      {
        test: /\.module\.s[ac]ss$/i,
        use: [
          styleLoader,
          {
            loader: "css-loader",
            options: {
              modules: {
                exportLocalsConvention: "camelCaseOnly",
              },
            },
          },
          "sass-loader",
        ],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    alias: {},
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./public/template.html"),
      publicPath: "/",
    }),
    isProd && new MiniCssExtractPlugin(),
  ].filter(Boolean),
  devServer: {
    hot: true,
    historyApiFallback: true,
    port: 3000,
    proxy: {
      "/api/keekijanai": "http://127.0.0.1:3001",
    },
  },
};
