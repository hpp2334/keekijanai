import React from 'react'
import { getClient } from 'keekijanai-react';

export const wrapRootElement = ({ element }, pluginOptions) => {
  const options = { ...pluginOptions };
  delete options.plugins;
  if (Object.keys(options).length > 0) {
    getClient().updateConfig(options);
  }

  return element;
}
