import { Chip, Stack, styled } from "@/components";
import { useObservableState } from "observable-hooks";
import React, { useEffect } from "react";
import { isNil, SourceNameMap } from "@keekijanai/frontend-core";
import { useInternalCodeContext } from "./InternalCodeContext";
import { SyntaxHighlighter } from "@/components/SyntaxHighlighter";

export interface CodeSourcesProps {
  /** 获取文件自身内容（即源码），如使用 webpack，可以使用 require.context API 与 raw-loader */
  getSource: (key: string) => string | { default: string };
  /** 从 key 映射到 name，渲染时标签页名称会使用 name */
  sourceKeyMap?: SourceNameMap;
  /** 需要显示源代码的文件的 key 组成的数组 */
  sourceKeyList: string[];
}

export interface CodeSourceContentProps {
  code: string;
  lang?: string;
}
export interface CodeSourceProps {
  getSource: (key: string) => string | { default: string };
  sourceKey: string;
}

const SourceChipContainer = styled("div")({
  display: "flex",
  flexWrap: "wrap",
  gap: "4px",
});

const customSyntaxHighlighterStyle: React.CSSProperties = {
  fontSize: 12,
};

export const CodeSourceContent = ({ code, lang }: CodeSourceContentProps) => {
  return (
    <SyntaxHighlighter customStyle={customSyntaxHighlighterStyle} language={lang}>
      {code}
    </SyntaxHighlighter>
  );
};

export const CodeSource = ({ getSource, sourceKey }: CodeSourceProps) => {
  const { codeService } = useInternalCodeContext();
  codeService.setGetSource(getSource);
  const currentSourceCode = useObservableState(codeService.currentSourceCode$, null);
  const currentSourceCodeLang = useObservableState(codeService.currentSourceCodeLanguage$, null) ?? "javascript";

  useEffect(() => {
    codeService.sourceKeys$.next([sourceKey]);
  }, []);

  return isNil(currentSourceCode) ? null : <CodeSourceContent code={currentSourceCode} lang={currentSourceCodeLang} />;
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
      {!isNil(currentSourceCode) && <CodeSourceContent code={currentSourceCode} lang={currentSourceCodeLang} />}
    </div>
  );
};
