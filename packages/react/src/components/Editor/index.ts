// toolbar
export * as toolbar from './plugins/toolbar';

// image
import _createImagePlugin from '@draft-js-plugins/image';
import { ImageAddButton } from './components/image';

function createImagePlugin() {
  const imagePlugin = _createImagePlugin({
    theme: {
      image: 'kkjn__image',
    }
  });
  return imagePlugin;
}

export const image = {
  createImagePlugin,
  ImageAddButton,
};

export * as toolbarRich from './plugins/toolbar-rich';

export * from './Editor';
