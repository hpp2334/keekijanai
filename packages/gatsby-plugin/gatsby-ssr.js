import { applyOptions } from './apply-react-client-config';

export const wrapRootElement = ({ element }, pluginOptions) => {
  applyOptions(pluginOptions);

  return element;
}
