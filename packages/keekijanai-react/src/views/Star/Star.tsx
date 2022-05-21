import styles from "./star.module.scss";
import { composeHOC, withCSSBaseline, withNoSSR } from "@/common/hoc";
import { IconButton, Stack, Statical } from "@/components";
import { AuthService, StarService, StarType } from "@keekijanai/frontend-core";
import { MdSentimentSatisfiedAlt, MdSentimentNeutral, MdSentimentVeryDissatisfied } from "react-icons/md";
import { useObservableEagerState } from "observable-hooks";
import { useCallback } from "react";
import { showAuthModal } from "../Auth";
import { useInternalAuthContext } from "../Auth/Context";
import { useStarService } from "./logic";
import { injectCSS } from "@/common/styles";
import clsx from "clsx";

export interface StarProps {
  belong: string;
}

const StarContainer = injectCSS("div", styles.starContainer);

const starConfig = [
  {
    type: StarType.Good,
    Icon: MdSentimentSatisfiedAlt,
  },
  {
    type: StarType.JustOK,
    Icon: MdSentimentNeutral,
  },
  {
    type: StarType.Bad,
    Icon: MdSentimentVeryDissatisfied,
  },
];

const withFeature = composeHOC(withNoSSR, withCSSBaseline);

export const Star = withFeature(({ belong }: StarProps) => {
  const { authService } = useInternalAuthContext();
  const starService = useStarService(belong);

  const star = useObservableEagerState(starService.current$);

  const handleClickStar = useCallback(
    (star: StarType) => () => {
      if (authService.isLogin()) {
        starService.update(star).subscribe();
      } else {
        showAuthModal();
      }
    },
    [authService, starService]
  );

  console.debug("[React][Star]", { star });

  return (
    <div className={styles.starRoot}>
      <StarContainer>
        <Statical value={star?.total} />
        <Stack direction="row" spacing={1} alignItems="center">
          {starConfig.map(({ type, Icon }, index) => (
            <IconButton
              key={index}
              className={clsx(styles.starButton, type === star?.current && styles.current)}
              onClick={handleClickStar(type)}
            >
              <Icon fontSize="inherit" />
            </IconButton>
          ))}
        </Stack>
      </StarContainer>
    </div>
  );
});
