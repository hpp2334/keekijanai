import { Descendant } from "slate";
import { Editor } from "./common";

export function serializeFromEditor(editor: Editor) {
  return JSON.stringify(editor.children);
}

export function deserializeToValue(value: string) {
  return JSON.parse(value) as Descendant[];
}
