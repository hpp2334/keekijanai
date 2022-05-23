import styles from "./stack.module.scss";
import { CommonStyleProps } from "@/common/styles";
import clsx from "clsx";
import React, { useMemo } from "react";

type Spacing = 0 | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;

interface StackProps extends CommonStyleProps {
  spacing?: 0 | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;
  direction?: "row" | "column";
  children?: React.ReactNode;
  alignItems?: React.CSSProperties["alignItems"];
  justifyContent?: React.CSSProperties["justifyContent"];
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const SPACING_CLASS_MAP: Record<Spacing, string | undefined> = {
  0: undefined,
  0.5: styles["spacingScale005"],
  1: styles["spacingScale010"],
  1.5: styles["spacingScale015"],
  2: styles["spacingScale020"],
  2.5: styles["spacingScale025"],
  3: styles["spacingScale030"],
  3.5: styles["spacingScale035"],
  4: styles["spacingScale040"],
  4.5: styles["spacingScale045"],
  5: styles["spacingScale050"],
};

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(function Stack(
  { spacing = 1, direction = "column", alignItems, justifyContent, className, style, onClick, children },
  ref
) {
  const extraStyle = useMemo(
    () => ({
      alignItems,
      justifyContent,
    }),
    [alignItems, justifyContent]
  );

  return (
    <div
      ref={ref}
      className={clsx(
        styles.stackRoot,
        direction === "row" && styles.row,
        direction === "column" && styles.column,
        SPACING_CLASS_MAP[spacing],
        className
      )}
      style={extraStyle}
      onClick={onClick}
    >
      {children}
    </div>
  );
});
