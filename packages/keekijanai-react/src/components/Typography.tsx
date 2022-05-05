/* eslint-disable react/display-name */
import React from "react";
import styles from "./typography.module.scss";

interface TypographyProps {
  children?: React.ReactNode;
}

export const Typography = React.memo(
  React.forwardRef<HTMLParagraphElement, TypographyProps>(function Typography({ children }, ref) {
    return (
      <p ref={ref} className={styles.typographyRoot}>
        {children}
      </p>
    );
  })
);
