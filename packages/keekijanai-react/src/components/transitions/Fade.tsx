// http://reactcommunity.org/react-transition-group/transition

import React, { useCallback, useLayoutEffect, useRef } from "react";
import { useMemo } from "react";
import { Transition } from "react-transition-group";

interface FadeProps {
  in: boolean;
  children?: React.ReactNode;
  duration?: number;
}

const transitionStyles = {
  entering: { opacity: 1 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 },
} as const;

export const Fade = React.forwardRef<HTMLDivElement, FadeProps>(function Fade(
  { in: inProp, duration = 3000, children },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) {
      return;
    }
    if (typeof ref === "function") {
      ref(containerRef.current);
    } else if (ref) {
      ref.current = containerRef.current;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, containerRef.current]);

  return (
    <Transition nodeRef={containerRef} in={inProp} appear={inProp ? true : undefined} timeout={duration}>
      {(state: keyof typeof transitionStyles) => (
        <div
          style={{
            transition: `opacity ${duration}ms ease-in-out`,
            ...transitionStyles[state],
          }}
          ref={containerRef}
        >
          {children}
        </div>
      )}
    </Transition>
  );
});
