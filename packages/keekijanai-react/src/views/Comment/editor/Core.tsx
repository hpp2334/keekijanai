import styles from "./comment-editor-core.module.scss";
import React, { useCallback, useState } from "react";
import { CommonStyleProps, injectCSS } from "@/common/styles";
import { DefaultElement, Editable, RenderElementProps, RenderLeafProps, Slate, withReact } from "slate-react";
import { createEditor, Descendant } from "slate";
import clsx from "clsx";
import { getMatchedClassListHandlerFactory, TextStyleBold, TextStyleItalic, TextStyleStrikeThrough } from "./TextStyle";
import { CustomElement, CustomElementType, Editor } from "./common";
import { buildToolbar, isMatchKeyboardKey } from "./Toolbar";

export interface CommentEditorCoreProps {
  refEditor?: React.MutableRefObject<Editor | undefined>;
  initialValue?: Descendant[];
  placeholder?: string;
  showToolbar?: boolean;
  readOnly?: boolean;
  classes?: {
    root?: string;
    editableRoot?: string;
    toolbarRoot?: string;
  };
}

const CommentEditorCoreRoot = injectCSS("div", styles.commentEditorCoreRoot);

const toolbarButtonItems = [TextStyleBold.buttonItem, TextStyleItalic.buttonItem, TextStyleStrikeThrough.buttonItem];
const getMatchedClassList = getMatchedClassListHandlerFactory([TextStyleBold, TextStyleItalic, TextStyleStrikeThrough]);

const DEFAULT_INITIAL_VALUE: CustomElement[] = [
  {
    type: CustomElementType.Text,
    children: [{ text: "" }],
  },
];

const Toolbar = buildToolbar({
  items: toolbarButtonItems,
});

// Define a React component to render leaves with bold text.
const Leaf = (props: RenderLeafProps) => {
  const node = props.leaf;

  return (
    <span {...props.attributes} className={clsx(styles.text, ...getMatchedClassList(node))}>
      {props.children}
    </span>
  );
};

const renderLeaf = (props: RenderLeafProps) => {
  return <Leaf {...props} />;
};

const renderElement = (props: RenderElementProps) => {
  switch (props.element.type) {
    default: {
      return <DefaultElement {...props} />;
    }
  }
};

export const CommentEditorCore = ({
  initialValue,
  placeholder,
  refEditor,
  readOnly = false,
  showToolbar = true,
  classes,
}: CommentEditorCoreProps) => {
  const [editor] = useState(() => withReact(createEditor()));
  if (refEditor) {
    refEditor.current = editor;
  }

  const handleKeyDown = useCallback(
    (ev: React.KeyboardEvent<HTMLDivElement>) => {
      toolbarButtonItems.forEach((buttonItem) => {
        if (isMatchKeyboardKey(ev, buttonItem)) {
          ev.preventDefault();
          const isActive = buttonItem.isActive(editor);
          buttonItem.onMouseDown(editor, isActive);
        }
      });
    },
    [editor]
  );

  return (
    <CommentEditorCoreRoot className={classes?.root}>
      <Slate editor={editor} value={initialValue ?? DEFAULT_INITIAL_VALUE}>
        {showToolbar && <Toolbar className={classes?.toolbarRoot} />}
        <Editable
          className={clsx(styles.editableRoot, showToolbar && styles.withToolbar, classes?.editableRoot)}
          readOnly={readOnly}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
      </Slate>
    </CommentEditorCoreRoot>
  );
};
