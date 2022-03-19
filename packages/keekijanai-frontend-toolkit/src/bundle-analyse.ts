import { program } from "commander";
import { webpack } from "webpack";
import { fs as memfs } from "memfs";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import { getBabelConfig } from "./get-babel-config";
import MiniCssExtractPlugin = require("mini-css-extract-plugin");
import path = require("path");
import { writeFileSync } from "fs";

interface BundleOptions {
  entry: string;
}

program
  .command("analyse")
  .option("-e, --entry <entry>", "entry", "./src/index.ts")
  .action(async function (opts: BundleOptions) {
    const outputDir = path.resolve(process.cwd(), "./dist");
    const compiler = webpack({
      mode: "production",
      entry: opts.entry,
      output: {
        path: outputDir,
        filename: "webpack-bundled.[name].js",
        library: {
          name: "temp",
          type: "umd",
          umdNamedDefine: true,
        },
      },
      module: {
        rules: [
          {
            test: /\.[jt]sx?$/,
            exclude: /node_modules/,
            use: {
              loader: require.resolve("babel-loader"),
              options: getBabelConfig({
                isProd: true,
                isTSX: true,
              }),
            },
          },
          {
            test: /\.css$/i,
            use: [MiniCssExtractPlugin.loader, "css-loader"],
          },
        ],
      },
      resolve: {
        extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
      },
      plugins: [new BundleAnalyzerPlugin(), new MiniCssExtractPlugin()],
    });
    // compiler.outputFileSystem = memfs;

    compiler.run((err, result) => {
      if (err) {
        console.error(err);
        return;
      }
      if (result?.hasErrors()) {
        console.error(result.toString());
        return;
      }
      result?.toString();
    });
  });
