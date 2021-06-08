import { getClient } from 'keekijanai-react';

export function applyOptions(pluginOptions) {
  const options = { ...pluginOptions };
  delete options.plugins;

  const reactClient = getClient();
  if (options.core) {
    reactClient.core.updateConfig(options.core);
  }
  reactClient.authModal.init(options.authModal);
}
