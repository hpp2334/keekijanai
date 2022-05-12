import styles from "./statical.module.scss";
import React from "react";
import { animated, useTransition } from "react-spring";
import { CommonStyleProps, injectCSS } from "@/common/styles";
import clsx from "clsx";

export interface StaticalProps extends CommonStyleProps {
  value: string | number | null | undefined;
}

const StaticalRoot = injectCSS("div", styles.staticalRoot);
const StaticalContent = injectCSS(
  animated.div as React.ComponentType<JSX.IntrinsicElements["div"]>,
  styles.staticalContent
);

export const Statical = ({ value, className, style }: StaticalProps) => {
  const text = value ?? "-";
  const transitions = useTransition(text, {
    from: {
      transform: "translateX(-50%) translateY(50%)",
    },
    enter: {
      transform: "translateX(-50%) translateY(-50%)",
    },
    leave: {
      transform: "translateX(-50%) translateY(-150%)",
    },
  });

  return (
    <StaticalRoot className={className} style={style}>
      {transitions((style, item) => (
        <StaticalContent style={{ ...(style as any) }}>{item}</StaticalContent>
      ))}
    </StaticalRoot>
  );
};
