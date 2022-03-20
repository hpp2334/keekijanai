import { Collapse } from "../Collapse";
import { blue, grey } from "@/components/colors";
import { Box, Link, styled } from "@/components";
import { useObservableState } from "observable-hooks";
import React, { useEffect } from "react";
import { isNil, Series as SeriesType } from "@keekijanai/frontend-core";
import { CommonStylesProps } from "@/common/react";
import { useGlobalService } from "../Global";
import { useSeriesService } from "./logic";

export interface SeriesProps extends CommonStylesProps {
  series: SeriesType | null;
}

const StyledSeriesItemContainer = styled(Box)({
  margin: "4px 0",
});

const StyledWithoutHrefLink = styled("div")(({ theme }) => ({}));

export const Series = ({ series, className, style }: SeriesProps) => {
  const seriesService = useSeriesService();
  const globalService = useGlobalService();

  const normalizedSeries = useObservableState(seriesService.normalizedSeries$, null);
  const currentPath = useObservableState(globalService.path$, null);

  console.debug("[Series]", {
    series,
    normalizedSeries,
    currentPath,
  });

  useEffect(() => {
    seriesService.series$.next(series);
  }, [series]);
  useEffect(() => {
    seriesService.currentPath$.next(currentPath);
  }, [currentPath]);

  if (isNil(normalizedSeries)) {
    return null;
  }

  return (
    <Collapse title={normalizedSeries.name} defaultExpanded={true} className={className} style={style}>
      <div>
        {normalizedSeries.data.map((item, index) => {
          const hasLink = !isNil(item.path);

          return (
            <StyledSeriesItemContainer
              sx={{
                marginLeft: (item.level - 1) * 2,
                color: item.match
                  ? // TODO replace
                    blue[500]
                  : item.disable
                  ? // TODO replace
                    grey[300]
                  : undefined,
              }}
              key={index}
            >
              {!hasLink && <StyledWithoutHrefLink>{item.title}</StyledWithoutHrefLink>}
              {hasLink && <Link href={`/${item.path}`}>{item.title}</Link>}
            </StyledSeriesItemContainer>
          );
        })}
      </div>
    </Collapse>
  );
};
