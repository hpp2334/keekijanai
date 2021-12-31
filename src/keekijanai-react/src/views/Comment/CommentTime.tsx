import React from "react";
import { format, formatDistance } from "date-fns";
import { useService } from "@/common/service";
import { TimeService } from "@keekijanai/frontend-core";
import { useObservableEagerState } from "observable-hooks";
import { Typography, Tooltip, styled } from "@/components";

export interface CommentTimeProps {
  timestamp: number;
}

const StyledDistanceText = styled(Typography)(({ theme }) => ({
  color: theme.palette.grey[400],
  cursor: "default",
}));

export const CommentTime = ({ timestamp }: CommentTimeProps) => {
  const timeService = useService(TimeService);
  const nowTimestamp = useObservableEagerState(timeService.now$);

  const distanceTimeText = formatDistance(timestamp, nowTimestamp);
  const detailTimeText = format(timestamp, "yyyy-MM-dd HH:mm:ss");

  return (
    <Tooltip title={detailTimeText} placement="top">
      <StyledDistanceText>{distanceTimeText}</StyledDistanceText>
    </Tooltip>
  );
};
