import styles from "./series.module.scss";
import { Collapse } from "../Collapse";
import { CollapseCore, Link } from "@/components";
import { useObservableState } from "observable-hooks";
import React, { useEffect } from "react";
import { isNil, Series as SeriesType } from "@keekijanai/frontend-core";
import { CommonStylesProps } from "@/common/react";
import { useGlobalService } from "../Global";
import { useSeriesService } from "./logic";
import clsx from "clsx";
import { constants, injectCSS } from "@/common/styles";
import { withCSSBaseline } from "@/common/hoc";
import { RiRhythmLine } from "react-icons/ri";
import { MdChevronRight } from "react-icons/md";
import { useSwitch } from "@/common/helper";

export interface SeriesProps extends CommonStylesProps {
  series: SeriesType | null;
}

const SeriesRoot = injectCSS("div", styles.seriesRoot);

const withFeature = withCSSBaseline;

export const Series = withFeature(({ series, className, style }: SeriesProps) => {
  const seriesService = useSeriesService();
  const globalService = useGlobalService();

  const expandSwitchHook = useSwitch();

  const normalizedSeries = useObservableState(seriesService.normalizedSeries$, null);
  const currentPath = useObservableState(globalService.path$, null);
  const currentSeries = useObservableState(seriesService.currentSeries$, null);

  console.debug("[Series]", {
    series,
    normalizedSeries,
    currentPath,
    currentSeries,
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

  const expandClass = expandSwitchHook.isOpen && styles.expand;

  return (
    <SeriesRoot className={clsx(expandClass, className)} style={style}>
      <div className={clsx(styles.seriesHeader, expandClass)} onClick={expandSwitchHook.toggle}>
        <div className={styles.icon}>
          <RiRhythmLine />
        </div>
        <div className={styles.seriesTitle}>{normalizedSeries.name}</div>
        {currentSeries && (
          <div className={styles.seriesHeaderItem}>
            <MdChevronRight className={clsx(styles.icon, expandClass)} />
            <div className={clsx(styles.itemTitle, expandClass)}>{currentSeries.title}</div>
          </div>
        )}
      </div>
      <CollapseCore expand={expandSwitchHook.isOpen}>
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
                {!hasLink && <div className={styles.content}>{item.title}</div>}
                {hasLink && (
                  <Link
                    className={clsx(styles.link, styles.content, !item.disable && styles.canHover)}
                    href={`/${item.path}`}
                  >
                    {item.title}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </CollapseCore>
      {/* <Collapse title={normalizedSeries.name} defaultExpanded={true}>
        <div className={styles.seriesContainer}>
          
        </div>
      </Collapse> */}
    </SeriesRoot>
  );
});
