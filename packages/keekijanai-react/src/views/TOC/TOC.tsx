import styles from "./toc.module.scss";
import { Stack, Typography } from "@/components";
import { useCallback, useEffect, useMemo } from "react";
import { TOCHeading, useInternalTOCContext } from "./Context";
import { useObservableState } from "observable-hooks";
import { CommonStylesProps } from "@/common/react";
import { constants, injectCSS } from "@/common/styles";
import clsx from "clsx";
import { withCSSBaseline } from "@/common/hoc";
import { useRef } from "react";
import { useRefList } from "@/common/helper";
import { keyBy } from "@keekijanai/frontend-core";

export interface TOCProps extends CommonStylesProps {
  // depend how to calculate active heading
  offsetY?: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TOCStaticProps extends CommonStylesProps {}

const TOCRoot = injectCSS("aside", styles.tocRoot);
const TOCItemText = injectCSS(Typography, styles.tocItemText);
const TOCItemContainer = injectCSS("li", styles.tocItemContainer);
const TOCItemList = injectCSS("ul", styles.tocItemList);
const TOCStaticItemList = injectCSS("ul", styles.tocStaticItemList);

const withFeature = withCSSBaseline;

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
    <TOCItemText className={clsx(isActive && styles.active)} onClick={handleClick}>
      {heading.title}
    </TOCItemText>
  );
}

function TOCActiveIndicator({ height, top }: { height?: number; top?: number }) {
  return (
    <div
      className={styles.tocActiveIndicatorRoot}
      style={{
        height,
        top,
      }}
    >
      <div className={styles.tocActiveIndicator} />
    </div>
  );
}

export const TOC = withFeature(({ className, style, offsetY = 0 }: TOCProps) => {
  const { tocService } = useInternalTOCContext();
  const headings = useObservableState(tocService.headings$);
  const headingIdMapIndex = useMemo(
    () =>
      headings.reduce((res, heading, index) => {
        res[heading.id] = index;
        return res;
      }, {} as Record<string, number>),
    [headings]
  );
  const activeHeading = useObservableState(tocService.activeHeading$);
  const tocItemsRefList = useRefList<HTMLLIElement>(headings.length);

  const activeHeadingRefStyle: { height?: number; top?: number } = useMemo(() => {
    if (!activeHeading) {
      return {};
    }
    const id = activeHeading.id;
    const index = headingIdMapIndex[id];
    const el = tocItemsRefList.getRef(index);
    if (!el) {
      return {};
    }

    const height = el.scrollHeight;
    const top = el.offsetTop;
    return {
      height,
      top,
    };
  }, [activeHeading, headingIdMapIndex, tocItemsRefList]);

  const minLevel = useMemo(
    () => headings.reduce((pre, cur) => Math.min(pre, cur.level), Number.MAX_SAFE_INTEGER),
    [headings]
  );

  useEffect(() => {
    tocService.offsetY$.next(offsetY);
  }, [offsetY, tocService.offsetY$]);

  return (
    <TOCRoot className={className} style={style}>
      <TOCItemList>
        <TOCActiveIndicator height={activeHeadingRefStyle.height} top={activeHeadingRefStyle.top} />
        <Stack spacing={0}>
          {headings.map((heading, index) => {
            const isActive = activeHeading === heading;
            return (
              <TOCItemContainer
                key={index}
                ref={(el) => {
                  if (el) {
                    tocItemsRefList.setRef(index, el);
                  }
                }}
                style={{
                  paddingLeft: (heading.level - minLevel + 1) * constants.baseSpacing * 3,
                }}
              >
                <TOCItem isActive={isActive} heading={heading} onClick={() => tocService.activateHeading(heading)} />
              </TOCItemContainer>
            );
          })}
        </Stack>
      </TOCItemList>
    </TOCRoot>
  );
});

export const TOCStatic = withFeature(({ className, style }: TOCStaticProps) => {
  const { tocService } = useInternalTOCContext();
  const headings = useObservableState(tocService.headings$);

  return (
    <TOCRoot className={className} style={style}>
      <TOCStaticItemList>
        <Stack spacing={1}>
          {headings.map((heading, index) => {
            return (
              <TOCItemContainer
                key={index}
                style={{
                  paddingLeft: (heading.level - 1) * constants.baseSpacing * 3,
                }}
              >
                <TOCItem isActive={false} heading={heading} onClick={() => tocService.activateHeading(heading)} />
              </TOCItemContainer>
            );
          })}
        </Stack>
      </TOCStaticItemList>
    </TOCRoot>
  );
});
