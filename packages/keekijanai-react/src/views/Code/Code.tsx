import React, { useMemo } from "react";
import { InternalCodeContext } from "./InternalCodeContext";
import { useCodeService } from "./logic";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CodeProps {}

export const Code: React.FC<CodeProps> = ({ children }) => {
  const codeService = useCodeService();

  return <InternalCodeContext codeService={codeService}>{children}</InternalCodeContext>;
};
