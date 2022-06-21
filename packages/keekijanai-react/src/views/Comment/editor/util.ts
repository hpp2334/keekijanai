import { Descendant, Text } from "slate";
import { CustomElementType } from "./common";

export function toPlainText(value: Descendant[]) {
  let res = "";
  for (const item of value) {
    if (Text.isText(item)) {
      res += item.text + "\n";
    } else if (item.type === CustomElementType.Text) {
      res += toPlainText(item.children);
    }
  }
  return res;
}
