import { EditorPlugin, GetSetEditorState } from "@draft-js-plugins/editor";
import { RichUtils } from "draft-js";
import React, { useCallback } from "react";
import FormatBoldOutlinedIcon from "@mui/icons-material/FormatBoldOutlined";
import FormatItalicOutlinedIcon from "@mui/icons-material/FormatItalicOutlined";
import FormatUnderlinedOutlinedIcon from "@mui/icons-material/FormatUnderlinedOutlined";
import StrikethroughSOutlinedIcon from "@mui/icons-material/StrikethroughSOutlined";
import { ToolbarButton } from "./ToolbarButton";
import { partial } from "lodash-es";

export type ToolbarStore = GetSetEditorState;

export interface ToolbarProps {
  className?: string;
  style?: React.CSSProperties;
}

export type ToolbarPlugin = EditorPlugin & {
  Toolbar: React.ComponentType<ToolbarProps>;
  _store: ToolbarStore;
};

const switchButtons = [
  { key: "bold", icon: <FormatBoldOutlinedIcon />, style: "BOLD" },
  { key: "italic", icon: <FormatItalicOutlinedIcon />, style: "ITALIC" },
  { key: "underline", icon: <FormatUnderlinedOutlinedIcon />, style: "UNDERLINE" },
  { key: "strike-through-out", icon: <StrikethroughSOutlinedIcon />, style: "STRIKE_THROUGH" },
];

export function createToolbarPlugin(): ToolbarPlugin {
  const store: ToolbarStore = {
    getEditorState: null as any,
    setEditorState: null as any,
  };

  function EditorToolbar(props: ToolbarProps) {
    const editorState = store.getEditorState();
    const currentStyle = editorState.getCurrentInlineStyle();

    const toggleInlineStyle = useCallback((inlineStyle: string, ev: React.MouseEvent) => {
      ev.stopPropagation();

      const editorState = store.getEditorState();
      const nextEditorState = RichUtils.toggleInlineStyle(editorState, inlineStyle);
      store.setEditorState(nextEditorState);
    }, []);

    return (
      <div style={props.style} className={props.className}>
        {switchButtons.map((item) => (
          <ToolbarButton
            key={item.key}
            icon={item.icon}
            active={currentStyle.has(item.style)}
            onClick={partial(toggleInlineStyle, item.style)}
          />
        ))}
      </div>
    );
  }

  return {
    initialize: ({ getEditorState, setEditorState }) => {
      store.getEditorState = getEditorState;
      store.setEditorState = setEditorState;
    },
    Toolbar: EditorToolbar,
    _store: store,
  };
}
