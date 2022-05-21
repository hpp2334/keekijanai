/* eslint-disable react/display-name */
import { CommonStyleProps } from "@/common/styles";
import clsx from "clsx";
import React from "react";
import styles from "./typography.module.scss";

interface TypographyProps extends CommonStyleProps {
  onClick?: JSX.IntrinsicElements["p"]["onClick"];
  children?: React.ReactNode;
}

export const Typography = React.memo(
  React.forwardRef<HTMLParagraphElement, TypographyProps>(function Typography(
    { className, style, onClick, children },
    ref
  ) {
    return (
      <p ref={ref} className={clsx(styles.typographyRoot, className)} style={style} onClick={onClick}>
        {children}
      </p>
    );
  })
);
