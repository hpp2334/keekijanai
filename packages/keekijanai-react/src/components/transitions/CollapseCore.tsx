import styles from "./collapse-core.module.scss";
import React, { useCallback, useRef } from "react";
import { nextFrame } from "@/common/helper";
import { injectCSS } from "@/common/styles";
import { Transition } from "react-transition-group";

export interface CollapseCoreProps {
  expand: boolean;
  duration?: number;
  children?: React.ReactNode;
}

enum HeightType {
  Auto,
  Matching,
  PreZero,
  Zero,
}

const CollapseCoreRoot = injectCSS("div", styles.collapseCoreRoot);
const CollapseContentWrapper = injectCSS("div", styles.collapseContentWrapper);

export const CollapseCore = ({ expand, duration = 200, children }: CollapseCoreProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heightTypeRef = useRef<HeightType>(HeightType.Zero);

  const setHeightZero = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    const transitionStr = `height ${duration}ms`;
    if (el.style.transition !== transitionStr) {
      el.style.transition = transitionStr;
    }
    heightTypeRef.current = HeightType.Zero;
    el.style.height = "0";
  }, [duration]);

  const setHeightMatching = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    heightTypeRef.current = HeightType.Matching;
    const elHeight = el.scrollHeight;
    el.style.height = `${elHeight}px`;
  }, []);

  const setHeightAuto = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    heightTypeRef.current = HeightType.Auto;
    el.style.height = "auto";
  }, []);

  const setHeightZeroWithPre = useCallback(() => {
    heightTypeRef.current = HeightType.PreZero;
    nextFrame(() => {
      if (heightTypeRef.current === HeightType.PreZero) {
        setHeightZero();
      }
    });
  }, [setHeightZero]);

  return (
    <CollapseCoreRoot>
      <Transition
        nodeRef={containerRef}
        in={expand}
        appear={true}
        timeout={duration}
        onEnter={setHeightZero}
        onEntering={setHeightMatching}
        onEntered={setHeightAuto}
        onExit={setHeightMatching}
        onExiting={setHeightZeroWithPre}
        onExited={setHeightZeroWithPre}
      >
        <CollapseContentWrapper ref={containerRef}>{children}</CollapseContentWrapper>
      </Transition>
    </CollapseCoreRoot>
  );
};
