import React, { useCallback, useMemo, useRef, useState } from "react";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import NativeEditor, { EditorPlugin } from "@draft-js-plugins/editor";
import { createToolbarPlugin } from "./plugins/toolbar";
import { Button, styled, useTheme } from "@/components";
import { useRemote } from "@/common/hooks/useRemote";
import { StateType } from "@/common/state";

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

const StyledEditContainer = styled("div")(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[300]}`,
  "& .DraftEditor-root": {
    padding: 10,
    minHeight: 60,
    maxHeight: 300,
  },
  "& .public-DraftEditorPlaceholder-root": {
    position: "relative",
  },
  "& .public-DraftEditorPlaceholder-inner": {
    position: "absolute",
    left: 0,
    top: 0,
    color: theme.palette.grey[300],
  },
}));

const StyledReadContainer = styled("div")({});

const StyledPanel = styled("div")({
  display: "flex",
  justifyContent: "space-between",
});

const StyledAction = styled("div")({
  display: "flex",
  gap: 1,
});

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
    <StyledContainer className="keekijanai-comment" onClick={handleClick}>
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
            <Button
              variant="text"
              color="inherit"
              size="small"
              onClick={onCancel}
              disabled={replyRS.type === StateType.Loading}
            >
              {texts?.cancel ?? "Cancel"}
            </Button>
            <Button
              variant="text"
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
  );
};
