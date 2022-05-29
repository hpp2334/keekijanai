import styles from "./collapse.module.scss";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Typography, Stack, CollapseCore } from "@/components";
import { useRefreshToken, useSwitch } from "@/common/helper";
import { withCSSBaseline } from "@/common/hoc";
import { CommonStylesProps } from "@/common/react";
import { MdKeyboardArrowRight } from "react-icons/md";
import clsx from "clsx";

export interface CollapseProps extends CommonStylesProps {
  title: React.ReactElement | string;
  /** (default: false) */
  defaultExpanded?: boolean;
  children?: React.ReactNode;
}

const CollapseContent = ({ children, onMount }: { children?: React.ReactNode; onMount: () => void }) => {
  useLayoutEffect(() => {
    setTimeout(() => {
      onMount();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
};

export const Collapse = withCSSBaseline(
  ({ title, defaultExpanded = false, children, className, style }: CollapseProps) => {
    const { isOpen, toggle } = useSwitch(defaultExpanded);

    return (
      <div className={clsx(styles.collapseRoot, isOpen && styles.expanded, className)} style={style}>
        <div className={clsx(styles.controllerBar, isOpen && styles.expanded)} onClick={toggle}>
          <Stack direction="row" alignItems="center">
            <MdKeyboardArrowRight fontSize="inherit" className={clsx(styles.expandIcon, isOpen && styles.expanded)} />
            {typeof title === "string" ? <Typography>{title}</Typography> : title}
          </Stack>
        </div>
        <CollapseCore expand={isOpen}>{children}</CollapseCore>
      </div>
    );
  }
);
