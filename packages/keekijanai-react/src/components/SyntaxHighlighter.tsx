import { PrismAsync as NativeSyntaxHighlighter, type SyntaxHighlighterProps } from "react-syntax-highlighter";
import { materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";

export function SyntaxHighlighter(props: SyntaxHighlighterProps) {
  return <NativeSyntaxHighlighter style={materialLight} {...props} />;
}
