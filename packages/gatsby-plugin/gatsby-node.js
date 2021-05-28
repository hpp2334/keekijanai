exports.onPreInit = (_, pluginOptions) => {
  if (pluginOptions) {
    client.updateConfig(pluginOptions);
  }
}