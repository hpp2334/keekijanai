import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";
import { Editor } from "slate";

export enum CustomElementType {
  Text,
}

export interface CustomText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strikeThrough?: boolean;
}

export interface CustomTextElement {
  type: CustomElementType.Text;
  children: CustomText[];
}

export type CustomElement = CustomTextElement;

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

export { Editor };
export { Text, Transforms } from "slate";
