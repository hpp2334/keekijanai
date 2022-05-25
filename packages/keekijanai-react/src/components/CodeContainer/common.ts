export interface CodeContainerProps {
  language?: string;
  /** code content */
  children: string;
}

export type CodeContainer = React.ComponentType<CodeContainerProps>;

export const customSyntaxHighlighterStyle: React.CSSProperties = {
  fontSize: "0.8em",
  margin: 0,
};
