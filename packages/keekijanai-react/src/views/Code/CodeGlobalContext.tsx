import { LazyCommentImport } from "@/common/lazy-component";
import { CodeContainer, FallbackCodeContainer } from "@/components";
import React, { useMemo } from "react";

export type CodeGlobalContextProps = React.PropsWithChildren<{ container: CodeContainer }>;

export const internalCodeGlobalContext = React.createContext<CodeContainer>(FallbackCodeContainer);

export function CodeGlobalContext({ container, children }: CodeGlobalContextProps) {
  return <internalCodeGlobalContext.Provider value={container}>{children}</internalCodeGlobalContext.Provider>;
}
