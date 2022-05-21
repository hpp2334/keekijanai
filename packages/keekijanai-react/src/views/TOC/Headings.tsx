import { isNil } from "@keekijanai/frontend-core";
import React, { useContext, useEffect, useRef } from "react";
import { useInternalTOCContext } from "./Context";

export type TOCLevel = 1 | 2 | 3 | 4;

export interface TOCHeadingProps {
  children?: React.ReactNode;
}

const createTOCHeading = (level: TOCLevel) => {
  return function TOCHeading({ children }: TOCHeadingProps) {
    const HeadingTag = `h${level}` as any as React.ComponentType<{
      ref?: React.LegacyRef<HTMLHeadingElement>;
    }>;
    const elRef = useRef<HTMLHeadingElement>(null);
    const { tocService } = useInternalTOCContext();

    useEffect(() => {
      const title = !isNil(children) ? children : "";
      tocService.collectHeading({
        level,
        title,
        ref: elRef,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tocService]);

    return <HeadingTag ref={elRef}>{children}</HeadingTag>;
  };
};

export const TOCHeadings = {
  H1: createTOCHeading(1),
  H2: createTOCHeading(2),
  H3: createTOCHeading(3),
  H4: createTOCHeading(4),

  h1: createTOCHeading(1),
  h2: createTOCHeading(2),
  h3: createTOCHeading(3),
  h4: createTOCHeading(4),
};
