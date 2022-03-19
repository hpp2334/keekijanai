import { createNonNullContext } from "@/common/react";
import React, { useEffect, useMemo, useRef } from "react";
import { TOCLevel } from "./Headings";
import { useTOCService } from "./logic";
import { TOCService } from "@keekijanai/frontend-core";

export type TOCHeading = {
  id: string;
  level: TOCLevel;
  title: any;
  ref: {
    current: HTMLHeadingElement | null;
  };
};

export interface TOCContextValue {
  tocService: TOCService;
}

const [internalTOCContext, useInternalTOCContext] = createNonNullContext<TOCContextValue>();

export { useInternalTOCContext };

export const TOCContext = ({ children }: { children: React.ReactNode }) => {
  const tocService = useTOCService();

  const ctxValue: TOCContextValue = useMemo(
    () => ({
      tocService,
    }),
    [tocService]
  );

  return <internalTOCContext.Provider value={ctxValue}>{children}</internalTOCContext.Provider>;
};
