import { CommonStyleProps, injectCSS } from "@/common/styles";
import clsx from "clsx";
import styles from "./alert.module.scss";

export interface AlertProps extends CommonStyleProps {
  children?: React.ReactNode;
}

export const AlertTitle = injectCSS("div", styles.alertTitleRoot);

export function Alert({ className, style, children }: AlertProps) {
  return (
    <div className={clsx(styles.alertRoot, className)} style={style}>
      {children}
    </div>
  );
}
