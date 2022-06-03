import styles from "./code.module.scss";
import { useObservableState } from "observable-hooks";
import React, { useContext, useEffect, useMemo } from "react";
import { isNil, SourceNameMap } from "@keekijanai/frontend-core";
import { useInternalCodeContext } from "./InternalCodeContext";
import { injectCSS } from "@/common/styles";
import clsx from "clsx";
import { internalCodeGlobalContext } from "./CodeGlobalContext";

interface CodeTabProps {
  active: boolean;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export interface CodeSourcesProps {
  /** Get source code. If in webpack，`require.context` and raw-loader can be used to get it */
  getSource: (key: string) => string | { default: string };
  /** Map source key to name, which is used in code tab */
  sourceKeyMap?: SourceNameMap;
  /** The list of source code keys */
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

const CodeTabContainer = injectCSS("div", styles.codeTabContainer);

const CodeTab = ({ active, onClick, children }: CodeTabProps) => {
  return (
    <div className={clsx(styles.codeTabRoot, active && styles.active)} onClick={onClick}>
      {children}
    </div>
  );
};

export const CodeSourceContent = ({ code, lang }: CodeSourceContentProps) => {
  const CodeContainer = useContext(internalCodeGlobalContext);
  return <CodeContainer language={lang}>{code}</CodeContainer>;
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
    <div className={styles.codeSourcesRoot}>
      <CodeTabContainer>
        {sourceEntries.map((sourceEntry, index) => (
          <CodeTab
            key={index}
            active={currentSourceKey === sourceEntry.key}
            onClick={() => codeService.currentSourceKey$.next(sourceEntry.key)}
          >
            {sourceEntry.name}
          </CodeTab>
        ))}
      </CodeTabContainer>
      {!isNil(currentSourceCode) && <CodeSourceContent code={currentSourceCode} lang={currentSourceCodeLang} />}
    </div>
  );
};
