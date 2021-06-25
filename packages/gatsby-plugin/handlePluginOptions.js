export function handlePluginOptions(pluginOptions) {
  const options = { ...pluginOptions };
  delete options.plugins;

  return {
    clientCoreOptions: options.core,
    authModalOptions: options.authModal,
  };
}
