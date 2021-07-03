const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: ['./src/main.tsx'],
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, './dist'),
    clean: true,
    publicPath: '/',
  },
  devtool: 'source-map',
  mode: 'development',
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    alias: {
      react: path.resolve('node_modules/react'),
      'react-dom': path.resolve('node_modules/react-dom'),
    },
  },
  
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        react: {
          test: /[\\/]node_modules[\\/]react[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        reactDOM: {
          test: /[\\/]node_modules[\\/]react-dom/,
          priority: -10,
          reuseExistingChunk: true,
        },
        kkjnClientCore: {
          test: /[\\/]client-core[\\/]dist/,
          priority: -15,
          reuseExistingChunk: true,
        },
        kkjnReactComponent: {
          test: /[\\/]react[\\/]dist/,
          priority: -15,
          reuseExistingChunk: true,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'tsx',
          target: 'es2015',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ]
};
