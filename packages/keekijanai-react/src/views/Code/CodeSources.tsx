import { Chip, Stack, styled } from "@mui/material";
import { useObservableState } from "observable-hooks";
import React, { useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { isNil, SourceNameMap } from "@keekijanai/frontend-core";
import { useInternalCodeContext } from "./InternalCodeContext";

export interface CodeSourcesProps {
  /** 获取文件自身内容（即源码），如使用 webpack，可以使用 require.context API 与 raw-loader */
  getSource: (key: string) => string | { default: string };
  /** 从 key 映射到 name，渲染时标签页名称会使用 name */
  sourceKeyMap?: SourceNameMap;
  /** 需要显示源代码的文件的 key 组成的数组 */
  sourceKeyList: string[];
}

const SourceChipContainer = styled("div")({
  display: "flex",
  flexWrap: "wrap",
  gap: "4px",
});

const customSyntaxHighlighterStyle: React.CSSProperties = {
  fontSize: 12,
};

export const CodeSources = ({ getSource, sourceKeyMap, sourceKeyList }: CodeSourcesProps) => {
  const { codeService } = useInternalCodeContext();
  codeService.setGetSource(getSource);

  const currentSourceKey = useObservableState(codeService.currentSourceKey$);
  const sourceEntries = useObservableState(codeService.sourceEntries$, []);
  const currentSourceCode = useObservableState(codeService.currentSourceCode$, null);
  const currentSourceCodeLang = useObservableState(codeService.currentSourceCodeLanguage$, null) ?? "javascript";

  console.debug("[CodeSources]", {
    currentSourceKey,
    sourceEntries,
    currentSourceCode,
  });

  useEffect(() => {
    codeService.sourceKeyMap$.next(sourceKeyMap ?? {});
    codeService.sourceKeys$.next(sourceKeyList);
  }, []);

  return (
    <div>
      <SourceChipContainer>
        {sourceEntries.map((sourceEntry, index) => (
          <Chip
            key={index}
            label={sourceEntry.name}
            color="primary"
            variant={currentSourceKey === sourceEntry.key ? undefined : "outlined"}
            onClick={() => codeService.currentSourceKey$.next(sourceEntry.key)}
          />
        ))}
      </SourceChipContainer>
      {!isNil(currentSourceCode) && (
        <SyntaxHighlighter
          customStyle={customSyntaxHighlighterStyle}
          language={currentSourceCodeLang}
          style={materialLight}
        >
          {currentSourceCode}
        </SyntaxHighlighter>
      )}
    </div>
  );
};
