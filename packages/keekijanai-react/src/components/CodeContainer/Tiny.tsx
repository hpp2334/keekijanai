/**
 * Preset supported languages:
 * - HTML (markup)
 * - CSS
 * - JavaScriptX
 * - TypeScriptX
 * - Java
 * - Golang
 * - Rust
 * - C, C++ (clike)
 * - Swift
 * - Kotlin
 * - SQL
 */

import { PrismLight as NativeSyntaxHighlighter } from "react-syntax-highlighter";
import { materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CodeContainerProps, customSyntaxHighlighterStyle } from "./common";

import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import rust from "react-syntax-highlighter/dist/esm/languages/prism/rust";
import clike from "react-syntax-highlighter/dist/esm/languages/prism/clike";
import swift from "react-syntax-highlighter/dist/esm/languages/prism/swift";
import kotlin from "react-syntax-highlighter/dist/esm/languages/prism/kotlin";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";

NativeSyntaxHighlighter.registerLanguage("html", markup);
NativeSyntaxHighlighter.registerLanguage("markup", markup);
NativeSyntaxHighlighter.registerLanguage("css", css);
NativeSyntaxHighlighter.registerLanguage("javascript", javascript);
NativeSyntaxHighlighter.registerLanguage("jsx", jsx);
NativeSyntaxHighlighter.registerLanguage("typescript", typescript);
NativeSyntaxHighlighter.registerLanguage("tsx", tsx);
NativeSyntaxHighlighter.registerLanguage("java", java);
NativeSyntaxHighlighter.registerLanguage("go", go);
NativeSyntaxHighlighter.registerLanguage("rust", rust);
NativeSyntaxHighlighter.registerLanguage("clike", clike);
NativeSyntaxHighlighter.registerLanguage("swift", swift);
NativeSyntaxHighlighter.registerLanguage("kotlin", kotlin);
NativeSyntaxHighlighter.registerLanguage("sql", sql);

export function TinyCodeContainer(props: CodeContainerProps) {
  return <NativeSyntaxHighlighter style={materialLight} customStyle={customSyntaxHighlighterStyle} {...props} />;
}
