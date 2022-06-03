import styles from "./fallback.module.scss";
import { injectCSS } from "@/common/styles";
import { CodeContainerProps, customSyntaxHighlighterStyle } from "./common";

const FallbackCodeContainerRoot = injectCSS("pre", styles.codeContainerRoot);

export function FallbackCodeContainer(props: CodeContainerProps) {
  return (
    <FallbackCodeContainerRoot style={customSyntaxHighlighterStyle}>
      <code>{props.children}</code>
    </FallbackCodeContainerRoot>
  );
}
