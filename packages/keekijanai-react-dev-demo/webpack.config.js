/* eslint-disable */
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const path = require("path");
const webpack = require("webpack");

const buildKKPackageModuleReplacementPluginEntry = (pkgName, pkgDir) => {
  const REG = new RegExp(pkgName);

  return new webpack.NormalModuleReplacementPlugin(REG, function (resource) {
    const workspaceRoot = path.resolve(__dirname, "../");
    const context = path.relative(workspaceRoot, resource.context);
    console.log({
      req: resource.request,
      context: resource.contextInfo.issuer,
    });

    if (resource.request === pkgName) {
      resource.request = path.join(workspaceRoot, pkgDir, "./src/index.ts");
    }
  });
};

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
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
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
    alias: {
      "@keekijanai/react": path.resolve(__dirname, "../keekijanai-react/src/index.ts"),
      "@keekijanai/frontend-core/libs/i18n": path.resolve(
        __dirname,
        "../keekijanai-frontend-core/src/libs/keekijanai-i18n/index.ts"
      ),
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
