import { PrismAsync as NativeSyntaxHighlighter } from "react-syntax-highlighter";
import { materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CodeContainerProps, customSyntaxHighlighterStyle } from "./common";

export function FullCodeContainer(props: CodeContainerProps) {
  return <NativeSyntaxHighlighter style={materialLight} customStyle={customSyntaxHighlighterStyle} {...props} />;
}
