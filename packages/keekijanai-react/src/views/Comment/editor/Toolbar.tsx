import styles from "./comment-editor-core.module.scss";
import { CommonStyleProps, injectCSS } from "@/common/styles";
import { useSlate } from "slate-react";
import { Editor } from "./common";
import clsx from "clsx";
import React from "react";
import { Stack } from "@/components";

export enum ToolbarItemType {
  Button,
}

export interface ToolbarButtonItem {
  type: ToolbarItemType.Button;
  icon: React.ComponentType;
  isActive: (editor: Editor) => boolean;
  onMouseDown: (editor: Editor, isActive: boolean) => void;
  keyboardKey: {
    ctrl?: boolean | null;
    key: string;
  } | null;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ToolbarProps extends CommonStyleProps {}

export type ToolbarItem = ToolbarButtonItem;

const ToolbarRoot = injectCSS("div", styles.toolbarRoot);
const ToolbarButton = injectCSS("button", styles.button);

export const isMatchKeyboardKey = (ev: React.KeyboardEvent<HTMLDivElement>, item: ToolbarItem) => {
  const keyboardKey = item.keyboardKey;
  if (!keyboardKey) {
    return false;
  }
  return ((ev.ctrlKey && keyboardKey.ctrl) || (!ev.ctrlKey && !keyboardKey.ctrl)) && ev.key === keyboardKey.key;
};

function ToolbarButtonComponent({ item }: { item: ToolbarButtonItem }) {
  const editor = useSlate();
  const Icon = item.icon;
  const isActive = item.isActive(editor);

  return (
    <ToolbarButton
      className={clsx(isActive && styles.active)}
      onMouseDown={() => {
        item.onMouseDown(editor, isActive);
      }}
    >
      <Icon />
    </ToolbarButton>
  );
}

export function buildToolbar({ items }: { items: ToolbarItem[] }) {
  return function Toolbar({}: ToolbarProps) {
    return (
      <ToolbarRoot>
        <Stack direction="row">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.type === ToolbarItemType.Button && <ToolbarButtonComponent key={index} item={item} />}
            </React.Fragment>
          ))}
        </Stack>
      </ToolbarRoot>
    );
  };
}
