import { BoldOutlined, ItalicOutlined, StrikethroughOutlined, UnderlineOutlined } from "@ant-design/icons";
import { Editor as NativeEditor, EditorState, RichUtils } from "draft-js";
import _ from "lodash";
import React, { useMemo } from "react";
import { useCallback } from "react";
import ToggleButton from "../../ui/Button/ToggleButton";
import { useNotNilContextValueFactory } from "../../util";
import { mergeStyles, StylesProps } from "../../util/style";

import './Editor.scss';

interface EditorProps {}
interface ToolbarProps {
  children?: React.ReactNode;
}
interface ContentContextValue {
  editorState: EditorState;
  onEditorStateChange: (next: EditorState) => void;
  readOnly: boolean;
}
interface ContainerProps extends StylesProps {
  value: EditorState;
  onChange: (next: EditorState) => void;
  children?: React.ReactNode;
  readOnly?: boolean;
}

const contentContext = React.createContext<ContentContextValue | null>(null);
const useContentContext = useNotNilContextValueFactory(contentContext);

const switchButtons = [
  { key: 'bold', prefix: <BoldOutlined />, style: 'BOLD' },
  { key: 'italic', prefix: <ItalicOutlined />, style: 'ITALIC' },
  { key: 'underline', prefix: <UnderlineOutlined />, style: 'UNDERLINE' },
  { key: 'strike-through-out', prefix: <StrikethroughOutlined />, style: 'STRIKE_THROUGH' },
];

const styleMap: Record<string, React.CSSProperties> = {
  'BOLD': {
    fontWeight: 700,
  },
  'STRIKE_THROUGH': {
    textDecoration: 'line-through',
  }
}

function EditorToolbarBasic() {
  const { editorState, onEditorStateChange } = useContentContext();
  const currentStyle = editorState.getCurrentInlineStyle();

  const toggleInlineStyle = useCallback(
    (inlineStyle: string) => {
      const nextEditorState = RichUtils.toggleInlineStyle(editorState, inlineStyle);
      onEditorStateChange(nextEditorState);
    },
    [editorState, onEditorStateChange]
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

export function EditorToolbar(props: ToolbarProps) {
  const {
    children,
  } = props;
  return (
    <div className="kkjn__toolbar">
      <EditorToolbarBasic />
      {children}
    </div>
  )
}

export function Editor(props: EditorProps) {
  const { editorState, onEditorStateChange, readOnly } = useContentContext();
  return (
    <div className="kkjn__editor">
      <NativeEditor
        readOnly={readOnly}
        editorState={editorState}
        onChange={onEditorStateChange}
        customStyleMap={styleMap}
      />
    </div>
  )
}

export function EditorContainer(props: ContainerProps) {
  const { value, onChange, children, readOnly } = props;

  const ctxValue = useMemo(() => ({
    editorState: value,
    onEditorStateChange: onChange,
    readOnly: !!readOnly,
  }), [value]);

  return (
    <contentContext.Provider value={ctxValue}>
      <div {...mergeStyles(props, ['kkjn__editor-container'])}>
        {children}
      </div>
    </contentContext.Provider>
  )
}
