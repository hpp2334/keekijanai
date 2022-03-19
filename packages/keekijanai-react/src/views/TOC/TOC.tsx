import { Box, makeStyles, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { isNil } from "lodash";
import React, { useCallback, useContext, useEffect, useRef } from "react";
import { TOCHeading, useInternalTOCContext } from "./Context";
import { useObservable, useObservableState, useSubscription } from "observable-hooks";

export interface TOCProps {
  className?: string;
  // depend how to calculate active heading
  offsetY?: number;
}

export interface TOCStaticProps {
  className?: string;
}

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

export const TOC = ({ className, offsetY = 0 }: TOCProps) => {
  const { tocService } = useInternalTOCContext();
  const headings = useObservableState(tocService.headings$);
  const activeHeading = useObservableState(tocService.activeHeading$);

  console.debug("[TOC]", { headings });

  useEffect(() => {
    tocService.offsetY$.next(offsetY);
  }, [offsetY, tocService.offsetY$]);

  return (
    <aside>
      <TOCItemList className={className}>
        {headings.map((heading, index) => {
          const isActive = activeHeading === heading;
          return (
            <TOCItemContainer
              key={index}
              component="li"
              sx={{
                paddingLeft: (heading.level - 1) * 2,
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

export const TOCStatic = ({ className }: TOCProps) => {
  const { tocService } = useInternalTOCContext();
  const headings = useObservableState(tocService.headings$);

  return (
    <aside>
      <TOCStaticItemList className={className}>
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
