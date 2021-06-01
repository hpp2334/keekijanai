import React from 'react'
import { Context, client } from 'keekijanai-react';

export const wrapRootElement = ({ element }, pluginOptions) => {
  const options = { ...pluginOptions };
  delete options.plugins;
  if (Object.keys(options).length > 0) {
    client.updateConfig(options);
  }

  return (
    <Context>
      {element}
    </Context>
  )
}
