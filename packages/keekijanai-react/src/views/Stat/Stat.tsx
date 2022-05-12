import styles from "./stat.module.scss";
import React from "react";
import { useObservableEagerState } from "observable-hooks";
import { Statical, Tooltip } from "@/components";
import { withNoSSR } from "@/common/hoc/withNoSSR";
import { useStatService } from "./logic";
import { composeHOC } from "@/common/hoc/composeHOC";
import { withCSSBaseline } from "@/common/hoc/withCSSBaseline";
import { injectCSS } from "@/common/styles";

export interface StatProps {
  belong: string;
}

const StatRoot = injectCSS("div", styles.statRoot);
const StatContainer = injectCSS("div", styles.statContainer);
const StaticalWrapper = injectCSS("div", styles.staticalWrapper);
const StatTitle = injectCSS("div", styles.statTitle);

const withFeature = composeHOC(withNoSSR, withCSSBaseline);

export const Stat = withFeature(({ belong }: StatProps) => {
  const service = useStatService(belong);
  const visit = useObservableEagerState(service.visit$);

  const pvText = `${visit?.pv ?? "-"} page visits`;

  return (
    <StatRoot>
      <StatContainer>
        <Tooltip title={pvText} placement="top">
          <StaticalWrapper>
            <Statical value={visit?.uv} />
          </StaticalWrapper>
        </Tooltip>
        <StatTitle>VIEWS</StatTitle>
      </StatContainer>
    </StatRoot>
  );
});
