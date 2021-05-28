const { client } = require('keekijanai-react/controller');

exports.onPreInit = (_, pluginOptions) => {
  const options = { ...pluginOptions };
  delete options.plugins;
  if (Object.keys(options) > 0) {
    client.updateConfig(options);
  }
}