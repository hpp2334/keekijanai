import styles from "./button.module.scss";
import { CommonStyleProps, injectCSS } from "@/common/styles";
import React from "react";
import clsx from "clsx";
import { LoadingDot } from "./LoadingDot";

export interface ButtonProps extends CommonStyleProps {
  color?: "primary" | "inherit";
  size?: "small" | "medium";
  variant?: "text" | "contained";
  disabled?: JSX.IntrinsicElements["button"]["disabled"];
  loading?: boolean;
  children?: React.ReactNode;
  onClick?: JSX.IntrinsicElements["button"]["onClick"];
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    disabled,
    onClick,
    className,
    style,
    color = "inherit",
    size = "medium",
    variant = "text",
    loading = false,
    children,
  },
  ref
) {
  const resolvedDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={resolvedDisabled}
      className={clsx(
        styles.buttonRoot,
        color === "primary" && styles.primary,
        size === "small" && styles.small,
        variant === "contained" && styles.contained,
        loading && styles.loading,
        className
      )}
      style={style}
      onClick={onClick}
    >
      {loading && (
        <LoadingDot classes={{ wrapper: clsx(styles.loadingDot, styles.loading), inner: clsx(styles.inner) }} />
      )}
      {children}
    </button>
  );
});
