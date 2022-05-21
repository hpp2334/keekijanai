import { withCSSBaseline } from "@/common/hoc/withCSSBaseline";
import React, { useMemo } from "react";
import { InternalCodeContext } from "./InternalCodeContext";
import { useCodeService } from "./logic";

import styles from "./code.module.scss";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CodeProps {}

export const Code: React.FC<CodeProps> = withCSSBaseline(({ children }) => {
  const codeService = useCodeService();

  return (
    <div className={styles.codeRoot}>
      <InternalCodeContext codeService={codeService}>{children}</InternalCodeContext>
    </div>
  );
});
