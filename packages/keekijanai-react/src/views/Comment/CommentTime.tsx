import styles from "./comment.module.scss";
import React from "react";
import format from "date-fns/format";
import formatDistance from "date-fns/formatDistance";
import { TimeService } from "@keekijanai/frontend-core";
import { useObservableEagerState } from "observable-hooks";
import { Typography, Tooltip } from "@/components";
import { useTimeService } from "../Time/logic";
import { injectCSS } from "@/common/styles";

export interface CommentTimeProps {
  timestamp: number;
}

const StyledDistanceText = injectCSS(Typography, [styles.commentTimeRoot, styles.commentTimeText]);

export const CommentTime = ({ timestamp }: CommentTimeProps) => {
  const timeService = useTimeService();
  const nowTimestamp = useObservableEagerState(timeService.now$);

  const distanceTimeText = formatDistance(timestamp, nowTimestamp);
  const detailTimeText = format(timestamp, "yyyy-MM-dd HH:mm:ss");

  return (
    <Tooltip title={detailTimeText} placement="top">
      <StyledDistanceText>{distanceTimeText}</StyledDistanceText>
    </Tooltip>
  );
};
