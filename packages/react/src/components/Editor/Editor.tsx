import { EditorState } from "draft-js";
import NativeEditor, { EditorPlugin } from '@draft-js-plugins/editor';
import _ from "lodash";
import React, { useCallback } from "react";
import { mergeStylesLeft, StylesProps } from "../../util/style";

import './Editor.scss';

interface EditorProps extends StylesProps {
  editorState: EditorState;
  onEditorStateChange: (next: EditorState) => void;
  readOnly?: boolean;
  plugins?: EditorPlugin[];
  placeholder?: string;
}

interface EditorContainerProps extends StylesProps {
  children?: React.ReactNode;
}

const styleMap: Record<string, React.CSSProperties> = {
  'BOLD': {
    fontWeight: 700,
  },
  'STRIKE_THROUGH': {
    textDecoration: 'line-through',
  }
};

export function EditorContainer(props: EditorContainerProps) {
  return (
    <div {...mergeStylesLeft("kkjn__editor-container", undefined, props)}>{props.children}</div>
  )
}

export function Editor(props: EditorProps) {
  const { editorState, onEditorStateChange, readOnly, placeholder, plugins } = props;

  return (
    <NativeEditor
      readOnly={readOnly}
      editorState={editorState}
      onChange={onEditorStateChange}
      plugins={plugins}
      customStyleMap={styleMap}
      placeholder={placeholder}
    />
  )
}
