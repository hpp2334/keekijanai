import styles from "./statical.module.scss";
import { CommonStyleProps, injectCSS } from "@/common/styles";
import { useTransition } from "./transitions/useTransition";

export interface StaticalProps extends CommonStyleProps {
  value: string | number | null | undefined;
}

const StaticalRoot = injectCSS("div", styles.staticalRoot);
const StaticalContent = injectCSS("div", styles.staticalContent);

export const Statical = ({ value, className, style }: StaticalProps) => {
  const text = value ?? "-";
  const transitions = useTransition(text, text, {
    transitions: {
      from: styles.from,
      enter: styles.enter,
      leave: styles.leave,
    },
    // from "statical.module.scss"
    durationMs: 500,
  });

  return (
    <StaticalRoot className={className} style={style}>
      {transitions((className, item) => (
        <StaticalContent className={className}>{item}</StaticalContent>
      ))}
    </StaticalRoot>
  );
};
