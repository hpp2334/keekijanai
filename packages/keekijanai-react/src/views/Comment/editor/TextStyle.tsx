import styles from "./comment-editor-core.module.scss";
import { MdFormatBold, MdFormatItalic, MdFormatStrikethrough } from "react-icons/md";
import { CustomText, Editor, Text, Transforms } from "./common";
import { ToolbarButtonItem, ToolbarItemType } from "./Toolbar";
import React from "react";

export interface TextStyleItem {
  buttonItem: ToolbarButtonItem;
  className?: string;
  is: (el: CustomText) => boolean;
}

const createIsActiveHandler = (key: keyof CustomText) => (editor: Editor) => {
  const [node] = Editor.nodes(editor, {
    match: (node) => Text.isText(node) && Boolean(node[key]),
  });
  return Boolean(node);
};

const createOnMouseDownHandler = (key: keyof CustomText) => (editor: Editor, isActive: boolean) => {
  Transforms.setNodes(
    editor,
    {
      [key]: !isActive,
    },
    { match: (node) => Text.isText(node), split: true }
  );
};

export function getMatchedClassListHandlerFactory(items: TextStyleItem[]) {
  return (node: CustomText) =>
    items
      .filter((item) => item.is(node))
      .map((item) => item.className)
      .filter(Boolean) as string[];
}

const TextStyleBoldButtonItem: ToolbarButtonItem = {
  type: ToolbarItemType.Button,
  icon: MdFormatBold,
  isActive: createIsActiveHandler("bold"),
  onMouseDown: createOnMouseDownHandler("bold"),
  keyboardKey: {
    ctrl: true,
    key: "b",
  },
};

export const TextStyleBold: TextStyleItem = {
  buttonItem: TextStyleBoldButtonItem,
  className: styles.bold,
  is: (el) => Boolean(el.bold),
};

const TextStyleItalicButtonItem: ToolbarButtonItem = {
  type: ToolbarItemType.Button,
  icon: MdFormatItalic,
  isActive: createIsActiveHandler("italic"),
  onMouseDown: createOnMouseDownHandler("italic"),
  keyboardKey: {
    ctrl: true,
    key: "i",
  },
};

export const TextStyleItalic: TextStyleItem = {
  buttonItem: TextStyleItalicButtonItem,
  className: styles.italic,
  is: (el) => Boolean(el.italic),
};

const TextStyleStrikeThroughButtonItem: ToolbarButtonItem = {
  type: ToolbarItemType.Button,
  icon: MdFormatStrikethrough,
  isActive: createIsActiveHandler("strikeThrough"),
  onMouseDown: createOnMouseDownHandler("strikeThrough"),
  keyboardKey: null,
};

export const TextStyleStrikeThrough: TextStyleItem = {
  buttonItem: TextStyleStrikeThroughButtonItem,
  className: styles.strikeThrough,
  is: (el) => Boolean(el.strikeThrough),
};
