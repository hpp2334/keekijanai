const path = require('path');

module.exports = {
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}],
    '@babel/preset-typescript',
  ],
  plugins: [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    "@babel/plugin-proposal-class-properties",
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        root: ["./"],
        alias: {
          "@": './src',
        }
      }
    ]
  ]
}