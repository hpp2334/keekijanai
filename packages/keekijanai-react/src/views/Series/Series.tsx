import styles from "./series.module.scss";
import { Collapse } from "../Collapse";
import { Link } from "@/components";
import { useObservableState } from "observable-hooks";
import React, { useEffect } from "react";
import { isNil, Series as SeriesType } from "@keekijanai/frontend-core";
import { CommonStylesProps } from "@/common/react";
import { useGlobalService } from "../Global";
import { useSeriesService } from "./logic";
import clsx from "clsx";
import { constants } from "@/common/styles";
import { withCSSBaseline } from "@/common/hoc";

export interface SeriesProps extends CommonStylesProps {
  series: SeriesType | null;
}

const withFeature = withCSSBaseline;

export const Series = withFeature(({ series, className, style }: SeriesProps) => {
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
    <div className={styles.seriesRoot}>
      <Collapse title={normalizedSeries.name} defaultExpanded={true} className={className} style={style}>
        <div className={styles.seriesContainer}>
          {normalizedSeries.data.map((item, index) => {
            const hasLink = !isNil(item.path);

            return (
              <div
                style={{
                  marginLeft: (item.level - 1) * constants.baseSpacing * 4,
                }}
                className={clsx(styles.seriesItem, item.disable && styles.disable, item.match && styles.match)}
                key={index}
              >
                {!hasLink && <div>{item.title}</div>}
                {hasLink && <Link href={`/${item.path}`}>{item.title}</Link>}
              </div>
            );
          })}
        </div>
      </Collapse>
    </div>
  );
});
