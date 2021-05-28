import { withCodeShow } from 'keekijanai-react';

export const requireRaw = require.context(
  '!raw-loader!./demo',
  true,
  /\.(js|css|html)/
);

export const requireDemo = require.context(
  './demo',
  true,
  /\.(js)/
);

export const CodeShow = withCodeShow(requireDemo, requireRaw);
