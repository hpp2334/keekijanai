import styles from "./loading-dot.module.scss";
import React from "react";
import clsx from "clsx";

export interface LoadingDotProps {
  classes?: {
    wrapper?: string;
    inner?: string;
  };
}

export function LoadingDot({ classes }: LoadingDotProps) {
  return (
    <div className={clsx(styles.loadingDotWrapper, classes?.wrapper)}>
      <div className={clsx(styles.loadingDot, classes?.inner)} />
    </div>
  );
}
