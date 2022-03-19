import { createNonNullContext } from "@/common/react";
import React, { useMemo } from "react";
import { CodeService } from "@keekijanai/frontend-core";

export interface InternalCodeContextValue {
  codeService: CodeService;
}

export interface InternalCodeContextProps {
  codeService: CodeService;
}

const [internalCodeContext, useInternalCodeContext] = createNonNullContext<InternalCodeContextValue>();

export { useInternalCodeContext };

export const InternalCodeContext: React.FC<InternalCodeContextProps> = ({ codeService, children }) => {
  const ctxValue: InternalCodeContextValue = useMemo(
    () => ({
      codeService,
    }),
    [codeService]
  );

  return <internalCodeContext.Provider value={ctxValue}>{children}</internalCodeContext.Provider>;
};
