const webpack = require("webpack");

module.exports.onCreateWebpackConfig = ({ stage, rules, loaders, plugins, actions }) => {
  if (stage === "build-html") {
    actions.setWebpackConfig({
      plugins: [
        new webpack.IgnorePlugin({
          resourceRegExp: /^node:/,
        }),
      ],
    });
  }
};
