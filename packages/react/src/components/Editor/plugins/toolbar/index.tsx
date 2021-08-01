import { BoldOutlined, ItalicOutlined, UnderlineOutlined, StrikethroughOutlined } from "@ant-design/icons";
import { EditorPlugin, GetSetEditorState } from "@draft-js-plugins/editor";

import { convertToRaw, EditorState, RichUtils } from "draft-js";
import _ from "lodash";
import React, { useCallback } from "react";
import ToggleButton from "../../../../ui/Button/ToggleButton";
import { mergeStyles, mergeStylesLeft, StylesProps } from "../../../../util/style";

import './index.scss';

export interface ToolbarStore extends GetSetEditorState {}

export interface ToolbarProps extends StylesProps {
  children?: (store: ToolbarStore) => JSX.Element;
  showBasic?: boolean;
}

interface ToolbarUnwrapperProps extends ToolbarProps {
  store: ToolbarStore;
}

export type ToolbarPlugin = EditorPlugin & {
  Toolbar: React.ComponentType<ToolbarProps>;
  _store: ToolbarStore;
};


const switchButtons = [
  { key: 'bold', prefix: <BoldOutlined />, style: 'BOLD' },
  { key: 'italic', prefix: <ItalicOutlined />, style: 'ITALIC' },
  { key: 'underline', prefix: <UnderlineOutlined />, style: 'UNDERLINE' },
  { key: 'strike-through-out', prefix: <StrikethroughOutlined />, style: 'STRIKE_THROUGH' },
];

function EditorToolbarBasic(props: ToolbarUnwrapperProps) {
  const { store } = props;
  const editorState = store.getEditorState();
  const currentStyle = editorState.getCurrentInlineStyle();

  const toggleInlineStyle = useCallback(
    (inlineStyle: string) => {
      const nextEditorState = RichUtils.toggleInlineStyle(editorState, inlineStyle);
      console.log('next', JSON.stringify(convertToRaw(nextEditorState.getCurrentContent())));
      store.setEditorState(nextEditorState);
    },
    [editorState, store.setEditorState]
  );

  return (
    <div>
      {switchButtons.map(item => (
        <ToggleButton
          key={item.key}
          prefix={item.prefix}
          active={currentStyle.has(item.style)}
          onToggle={_.partial(toggleInlineStyle, item.style)}
        />
      ))}
    </div>
  )
}

function EditorToolbarUnwrapper(props: ToolbarUnwrapperProps) {
  const {
    children,
    showBasic = true,

    store,
  } = props;
  return (
    <div {...mergeStylesLeft("kkjn__toolbar", undefined, props)}>
      {showBasic && <EditorToolbarBasic store={store} />}
      {children?.(store) ?? null}
    </div>
  )
}

export function createToolbarPlugin(): ToolbarPlugin {
  const store: ToolbarStore = {
    getEditorState: null as any,
    setEditorState: null as any,
  };

  function EditorToolbar(props: ToolbarProps) {
    return (
      <EditorToolbarUnwrapper {...props} store={store} />
    )
  }

  return {
    initialize: ({ getEditorState, setEditorState }) => {
      store.getEditorState = getEditorState;
      store.setEditorState = setEditorState;
    },
    Toolbar: EditorToolbar,
    _store: store,
  }
}
