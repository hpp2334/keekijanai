import styles from "./tooltip.module.scss";
import React, { useLayoutEffect, useRef } from "react";
import PopperUnstyled, { PopperUnstyledProps } from "@mui/base/PopperUnstyled";
import { useSwitch } from "@/common/helper";
import { injectCSS } from "@/common/styles";
import { TransitionGroup } from "react-transition-group";
import { Fade } from "./transitions/Fade";

export interface TooltipProps {
  title: string;
  placement?: PopperUnstyledProps["placement"];
  children: React.ReactElement;
}

const StyledPopper = injectCSS(PopperUnstyled, ["keekijanai-reset", styles.popper]);
const TootipContent = injectCSS("div", styles.tooltipContent);

export const Tooltip = ({ title, placement, children }: TooltipProps) => {
  const ref = useRef<HTMLElement>(null);
  const switchHook = useSwitch();

  const clonedChildren = React.cloneElement(children, {
    ...children.props,
    ref,
  });

  useLayoutEffect(() => {
    const current = ref.current;
    if (current) {
      const handleMouseEnter = () => {
        switchHook.open();
      };
      const handleMouseLeave = () => {
        switchHook.close();
      };

      current.addEventListener("mouseenter", handleMouseEnter);
      current.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        current.removeEventListener("mouseenter", handleMouseEnter);
        current.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <StyledPopper open={switchHook.isOpen} placement={placement} anchorEl={ref.current}>
        <Fade in={switchHook.isOpen} duration={200}>
          <TootipContent>{title}</TootipContent>
        </Fade>
      </StyledPopper>
      {clonedChildren}
    </>
  );
};
