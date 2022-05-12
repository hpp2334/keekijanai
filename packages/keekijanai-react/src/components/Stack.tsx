import { CommonStyleProps, constants } from "@/common/styles";
import { css } from "@emotion/css";
import clsx from "clsx";
import React, { useMemo } from "react";

interface StackProps extends CommonStyleProps {
  spacing?: number;
  direction?: "row" | "column";
  children?: React.ReactNode;
  alignItems?: React.CSSProperties["alignItems"];
  justifyContent?: React.CSSProperties["justifyContent"];
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(function Stack(
  { spacing = 1, direction = "column", alignItems, justifyContent, className, style, onClick, children },
  ref
) {
  const cls = useMemo(
    () =>
      css([
        {
          display: "flex",
          flexDirection: direction,
          alignItems,
          justifyContent,
        },
        direction === "column" && {
          "& > :not(style) + :not(style)": {
            marginBottom: 0,
            marginTop: constants.baseSpacing * spacing,
          },
        },
        direction === "row" && {
          "& > :not(style) + :not(style)": {
            marginRight: 0,
            marginLeft: constants.baseSpacing * spacing,
          },
        },
      ]),
    [alignItems, direction, justifyContent, spacing]
  );

  return (
    <div ref={ref} className={clsx(cls, className)} style={style} onClick={onClick}>
      {children}
    </div>
  );
});
