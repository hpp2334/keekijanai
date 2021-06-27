import { EditorState } from "draft-js";
import NativeEditor from '@draft-js-plugins/editor';
import _ from "lodash";
import React, { useCallback } from "react";
import { mergeStylesLeft, StylesProps } from "../../util/style";

import createImagePlugin, {  } from '@draft-js-plugins/image';
import createToolbarPlugin from './plugins/toolbar';
import { ImageAddButton } from './components/image';

import './Editor.scss';

interface EditorProps extends StylesProps {
  editorState: EditorState;
  onEditorStateChange: (next: EditorState) => void;
  readOnly?: boolean;
  showToolbar?: boolean;
}

const styleMap: Record<string, React.CSSProperties> = {
  'BOLD': {
    fontWeight: 700,
  },
  'STRIKE_THROUGH': {
    textDecoration: 'line-through',
  }
};


const toolbarPlugin = createToolbarPlugin();
const { Toolbar } = toolbarPlugin;

const imagePlugin = createImagePlugin({
  theme: {
    image: 'kkjn__image',
  }
});
const { addImage } = imagePlugin;

const plugins = [
  toolbarPlugin,
  imagePlugin,
];

export function Editor(props: EditorProps) {
  const { editorState, onEditorStateChange, readOnly = false, showToolbar = true } = props;

  const onImageLoad = useCallback(
    (url: string) => {
      const nextEditorState = addImage(editorState, url, {});
      onEditorStateChange(nextEditorState);
    },
    [editorState, onEditorStateChange],
  )

  return (
    <div {...mergeStylesLeft(["kkjn__editor", readOnly && "kkjn__read-only", !showToolbar && "kkjn__hide-toolbar"], undefined, props)}>
      <NativeEditor
        readOnly={readOnly}
        editorState={editorState}
        onChange={onEditorStateChange}
        plugins={plugins}
        customStyleMap={styleMap}
      />
      <Toolbar {...mergeStylesLeft(["kkjn__toolbar"])}>
      {() => (
        <div>
          <ImageAddButton onload={onImageLoad} />
        </div>
      )}
      </Toolbar>
    </div>
  )
}
