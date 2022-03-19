import { StatService } from "@keekijanai/frontend-core";
import React from "react";
import { useObservableEagerState } from "observable-hooks";
import { Statical, styled, Tooltip } from "@/components";
import { withNoSSR } from "@/common/hoc/withNoSSR";
import { useStatService } from "./logic";

export interface StatProps {
  belong: string;
}

const StatContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const StaticalWrapper = styled("div")(({ theme }) => ({
  width: "5rem",
}));

const StatTitle = styled("div")(({ theme }) => ({
  fontSize: 12,
  color: theme.palette.text.secondary,
  height: "40px",
  display: "flex",
  alignItems: "center",
}));

export const Stat = withNoSSR(({ belong }: StatProps) => {
  const service = useStatService(belong);
  const visit = useObservableEagerState(service.visit$);

  const pvText = `${visit?.pv ?? "-"} page visits`;

  return (
    <StatContainer>
      <Tooltip title={pvText} placement="top">
        <StaticalWrapper>
          <Statical value={visit?.uv} />
        </StaticalWrapper>
      </Tooltip>
      <StatTitle>VIEWS</StatTitle>
    </StatContainer>
  );
});
