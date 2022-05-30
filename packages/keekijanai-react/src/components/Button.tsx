import styles from "./button.module.scss";
import { CommonStyleProps, injectCSS } from "@/common/styles";
import React from "react";
import clsx from "clsx";

export interface ButtonProps extends CommonStyleProps {
  color?: "primary" | "inherit";
  size?: "small" | "medium";
  variant?: "text" | "contained";
  disabled?: JSX.IntrinsicElements["button"]["disabled"];
  onClick?: JSX.IntrinsicElements["button"]["onClick"];
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { disabled, onClick, className, style, color = "inherit", size = "medium", variant = "text", children },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={clsx(
        styles.buttonRoot,
        color === "primary" && styles.primary,
        size === "small" && styles.small,
        variant === "contained" && styles.contained,
        className
      )}
      style={style}
      onClick={onClick}
    >
      {children}
    </button>
  );
});
