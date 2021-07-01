import { createToolbarPlugin, ToolbarProps, ToolbarStore } from '../toolbar';
import { image } from '../../';
import { useCallback } from 'react';
import { EditorPlugin } from '@draft-js-plugins/editor';

import createImagePlugin from '@draft-js-plugins/image';
import { ImageAddButton } from '../../components/image';
const imagePlugin = createImagePlugin();
const { addImage } = imagePlugin;


interface ToolbarRichProps {
  showImage?: boolean;
}

interface ToolbarRichUnwrapperProps extends ToolbarRichProps {
  ToolbarBase: React.ComponentType<ToolbarProps>;
  store: ToolbarStore;
}

export type ToolbarRichPlugin = EditorPlugin & {
  ToolbarRich: React.ComponentType<ToolbarRichProps>;
  dependPlugins: EditorPlugin[];
};


function ToolbarRichUnwrapper(props: ToolbarRichUnwrapperProps) {
  const {
    ToolbarBase,
    store,
    showImage,
  } = props;

  const editorState = store.getEditorState();
  const onEditorStateChange = store.setEditorState;

  const onImageLoad = useCallback(
    (url: string) => {
      const nextEditorState = addImage(editorState, url, {});
      onEditorStateChange(nextEditorState);
    },
    [editorState, onEditorStateChange],
  )

  return (
    <ToolbarBase>
    {() => (
      <div>
        {showImage && <ImageAddButton onload={onImageLoad} />}
      </div>
    )}
    </ToolbarBase>
  )
}

export function createToolbarRichPlugin(): ToolbarRichPlugin {
  const { _store, initialize, Toolbar } = createToolbarPlugin();

  function EditorToolbarRich(props: ToolbarRichProps) {
    return (
      <ToolbarRichUnwrapper ToolbarBase={Toolbar} store={_store} {...props} />
    )
  }

  return {
    initialize,
    ToolbarRich: EditorToolbarRich,
    dependPlugins: [
      imagePlugin,
    ]
  }
}
