import React from 'react';
import { KeekijanaiContext } from 'keekijanai-react';
import { handlePluginOptions } from './handlePluginOptions';

export const wrapRootElement = ({ element }, pluginOptions) => {
  const contextProps = handlePluginOptions(pluginOptions);

  return (
    <KeekijanaiContext {...contextProps}>
      {element}
    </KeekijanaiContext>
  );
}
