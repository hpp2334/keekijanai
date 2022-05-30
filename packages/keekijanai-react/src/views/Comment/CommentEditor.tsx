import styles from "./comment-editor.module.scss";
import React, { useCallback, useMemo, useRef } from "react";
import { injectCSS } from "@/common/styles";
import { CommentEditorCore, CommentEditorCoreProps, deserializeToValue, serializeFromEditor, Editor } from "./editor";
import { useTranslation } from "@/common/i18n";
import { Button } from "@/components";
import clsx from "clsx";

export enum CommentEditorMode {
  Read,
  Edit,
}

export interface CommentEditorProps {
  initialValue?: string;
  mode?: CommentEditorMode;
  placeholder?: string;
  classes?: {
    root?: string;
    editor?: string;
  };

  onReply?: (value: string) => Promise<unknown>;
  onCancel?: () => void;
}

const CommentEditorRoot = injectCSS("div", styles.commentEditorRoot);
const StyledPanel = injectCSS("div", styles.panel);

export const CommentEditor = React.forwardRef<HTMLDivElement, CommentEditorProps>(function CommentEditor(
  { initialValue, mode = CommentEditorMode.Edit, placeholder, classes, onReply, onCancel },
  ref
) {
  const refEditor = useRef<Editor>();
  const { t } = useTranslation("Comment");

  const parsedInitialValue: CommentEditorCoreProps["initialValue"] = useMemo(() => {
    if (!initialValue) {
      return undefined;
    }
    return deserializeToValue(initialValue);
  }, [initialValue]);

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  const handleReply = useCallback(() => {
    if (!refEditor.current) {
      return;
    }
    const editor = refEditor.current;
    const value = serializeFromEditor(editor);
    onReply?.(value);
  }, [onReply]);

  const overrideClasses = useMemo(() => {
    if (mode === CommentEditorMode.Read) {
      return {
        root: clsx(styles.readCoreRoot, classes?.editor),
        editableRoot: styles.readCoreEditableRoot,
      };
    }
  }, [classes?.editor, mode]);

  return (
    <CommentEditorRoot className={classes?.root} ref={ref}>
      <CommentEditorCore
        refEditor={refEditor}
        initialValue={parsedInitialValue}
        placeholder={placeholder}
        showToolbar={mode === CommentEditorMode.Edit}
        readOnly={mode === CommentEditorMode.Read}
        classes={overrideClasses}
      />
      {mode === CommentEditorMode.Edit && (
        <StyledPanel>
          <Button onClick={handleCancel}>{t("editor.action.cancel")}</Button>
          <Button onClick={handleReply} variant="contained" color="primary">
            {t("editor.action.post")}
          </Button>
        </StyledPanel>
      )}
    </CommentEditorRoot>
  );
});
