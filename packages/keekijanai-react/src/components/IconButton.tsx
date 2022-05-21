import { CommonStyleProps } from "@/common/styles";
import clsx from "clsx";
import React from "react";
import styles from "./icon-button.module.scss";

interface IconButtonProps extends CommonStyleProps {
  active?: boolean;
  onClick?: JSX.IntrinsicElements["button"]["onClick"];
  children?: React.ReactNode;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { active = false, onClick, children, className, style },
  ref
) {
  return (
    <button
      ref={ref}
      className={clsx(styles.iconButtonRoot, active && styles.active, className)}
      style={style}
      onClick={onClick}
    >
      {children}
    </button>
  );
});
