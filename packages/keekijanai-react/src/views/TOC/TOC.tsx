import { Box, makeStyles, Typography, styled } from "@/components";
import { isNil } from "lodash";
import React, { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { TOCHeading, useInternalTOCContext } from "./Context";
import { useObservable, useObservableState, useSubscription } from "observable-hooks";
import { CommonStylesProps } from "@/common/react";

export interface TOCProps extends CommonStylesProps {
  // depend how to calculate active heading
  offsetY?: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TOCStaticProps extends CommonStylesProps {}

const TOCItemText = styled(Typography)({
  fontSize: 14,
});

const TOCItemContainer = styled(Box)(({ theme }) => ({
  display: "block",
  cursor: "pointer",
  marginBottom: 4,
  "&:last-child": {
    marginBottom: 0,
  },
}));

const TOCItemList = styled("ul")(({}) => ({
  maxWidth: 200,
  maxHeight: 600,
  overflowY: "auto",
}));

const TOCStaticItemList = styled("ul")(({}) => ({}));

function TOCItem({
  heading,
  isActive,
  onClick,
}: {
  heading: TOCHeading;
  isActive: boolean;
  onClick: (heading: TOCHeading) => void;
}) {
  const handleClick = useCallback(() => {
    onClick(heading);
  }, [heading, onClick]);

  return (
    <TOCItemText
      sx={{
        color: isActive ? "primary.main" : "text.secondary",
      }}
      onClick={handleClick}
    >
      {heading.title}
    </TOCItemText>
  );
}

export const TOC = ({ className, style, offsetY = 0 }: TOCProps) => {
  const { tocService } = useInternalTOCContext();
  const headings = useObservableState(tocService.headings$);
  const activeHeading = useObservableState(tocService.activeHeading$);

  const minLevel = useMemo(
    () => headings.reduce((pre, cur) => Math.min(pre, cur.level), Number.MAX_SAFE_INTEGER),
    [headings]
  );

  useEffect(() => {
    tocService.offsetY$.next(offsetY);
  }, [offsetY, tocService.offsetY$]);

  return (
    <aside>
      <TOCItemList className={className} style={style}>
        {headings.map((heading, index) => {
          const isActive = activeHeading === heading;
          return (
            <TOCItemContainer
              key={index}
              component="li"
              sx={{
                paddingLeft: (heading.level - minLevel + 1) * 2,
                borderLeft: `3px solid transparent`,
                borderLeftColor: isActive ? "primary.main" : undefined,
              }}
            >
              <TOCItem isActive={isActive} heading={heading} onClick={() => tocService.activateHeading(heading)} />
            </TOCItemContainer>
          );
        })}
      </TOCItemList>
    </aside>
  );
};

export const TOCStatic = ({ className, style }: TOCStaticProps) => {
  const { tocService } = useInternalTOCContext();
  const headings = useObservableState(tocService.headings$);

  return (
    <aside>
      <TOCStaticItemList className={className} style={style}>
        {headings.map((heading, index) => {
          return (
            <TOCItemContainer
              key={index}
              component="li"
              sx={{
                paddingLeft: (heading.level - 1) * 2,
              }}
            >
              <TOCItem isActive={false} heading={heading} onClick={() => tocService.activateHeading(heading)} />
            </TOCItemContainer>
          );
        })}
      </TOCStaticItemList>
    </aside>
  );
};
