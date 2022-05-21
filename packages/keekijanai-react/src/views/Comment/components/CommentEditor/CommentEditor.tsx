import styles from "./comment-editor.module.scss";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import NativeEditor, { EditorPlugin } from "@draft-js-plugins/editor";
import { createToolbarPlugin } from "./plugins/toolbar";
import { Button } from "@/components";
import { useRemote } from "@/common/hooks/useRemote";
import { StateType } from "@/common/state";
import { injectCSS } from "@/common/styles";

export interface CommentEditorProps {
  initialValue?: string;
  mode?: "read" | "edit";
  placeholder?: string;

  className?: string;
  style?: React.CSSProperties;

  texts?: {
    post?: string;
    cancel?: string;
  };

  onReply?: (value: string) => Promise<unknown>;
  onCancel?: () => void;
}

const CommentEditorRoot = injectCSS("div", styles.commentEditorRoot);
const StyledEditContainer = injectCSS("div", styles.editContainer);
const StyledReadContainer = injectCSS("div", styles.readContainer);
const StyledPanel = injectCSS("div", styles.panel);
const StyledAction = injectCSS("div", styles.action);

const styleMap: Record<string, React.CSSProperties> = {
  BOLD: {
    fontWeight: 700,
  },
  STRIKE_THROUGH: {
    textDecoration: "line-through",
  },
};

export const CommentEditor = ({
  initialValue,
  mode = "edit",
  placeholder,
  texts,
  onReply,
  onCancel,
}: CommentEditorProps) => {
  const StyledContainer = mode === "edit" ? StyledEditContainer : StyledReadContainer;
  const [replyRS, handleReply] = useRemote(
    useCallback(
      async (content: string) => {
        if (onReply) {
          return await onReply(content);
        }
      },
      [onReply]
    )
  );

  const { Toolbar, plugins } = useMemo(() => {
    const toolbarPlugin = createToolbarPlugin();
    const { Toolbar } = toolbarPlugin;

    const plugins = [toolbarPlugin];
    return {
      Toolbar,
      plugins,
    } as const;
  }, []);

  const [editorState, setEditorState] = useState(() => {
    if (initialValue) {
      const raw = JSON.parse(initialValue);
      const contentState = convertFromRaw(raw);
      return EditorState.createWithContent(contentState);
    } else {
      return EditorState.createEmpty();
    }
  });

  const refEditor = useRef<NativeEditor>(null);

  const handleClick = useCallback(() => {
    refEditor.current?.focus();
  }, []);

  const handleClickReply = useCallback(() => {
    const contentState = editorState.getCurrentContent();
    const content = JSON.stringify(convertToRaw(contentState));
    handleReply(content);
  }, [editorState, handleReply]);

  return (
    <CommentEditorRoot>
      <StyledContainer onClick={handleClick}>
        <NativeEditor
          ref={refEditor}
          readOnly={mode === "read"}
          editorState={editorState}
          onChange={setEditorState}
          plugins={plugins}
          customStyleMap={styleMap}
          placeholder={placeholder}
        />
        {mode === "edit" && (
          <StyledPanel>
            <Toolbar />
            <StyledAction>
              <Button color="inherit" size="small" onClick={onCancel} disabled={replyRS.type === StateType.Loading}>
                {texts?.cancel ?? "Cancel"}
              </Button>
              <Button
                color="primary"
                size="small"
                onClick={handleClickReply}
                disabled={replyRS.type === StateType.Loading}
              >
                {texts?.post ?? "Post"}
              </Button>
            </StyledAction>
          </StyledPanel>
        )}
      </StyledContainer>
    </CommentEditorRoot>
  );
};
