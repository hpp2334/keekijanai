import styles from "./reading-progress.module.scss";
import React, { useRef } from "react";
import { useObservableState } from "observable-hooks";
import clsx from "clsx";
import { useReadingProgressService } from "./logic";
import { useGlobalDrag, useGlobalService } from "../Global";
import { BiUpArrowAlt } from "react-icons/bi";
import { withCSSBaseline } from "@/common/hoc";

export interface ReadingProgressProps {
  className?: string;
}

const ReadingProgressRoot = ({ className }: ReadingProgressProps) => {
  const readingProgressService = useReadingProgressService();
  const globalService = useGlobalService();
  const containerRef = useRef<HTMLDivElement>(null);

  const progress = useObservableState(readingProgressService.progress$, 0);

  const progressRotationBlockStyle: React.CSSProperties = {
    top: -40 * progress,
  };

  useGlobalDrag(containerRef);

  return (
    <div className={clsx(styles.paginationRoot, className)} ref={containerRef}>
      <button className={clsx(styles.paginationButton)} onMouseUp={globalService.toTop}>
        <div className={clsx(styles.before)} style={progressRotationBlockStyle} />
        <BiUpArrowAlt className={clsx(styles.arrowIcon, progress >= 0.7 && styles.almostEnd)} />
        <div className={clsx(styles.after)} style={progressRotationBlockStyle} />
      </button>
    </div>
  );
};

const withFeature = withCSSBaseline;

export const ReadingProgress = withFeature(ReadingProgressRoot);
