import { useService } from "@/common/service/useService";
import { IconButton, styled, Statical } from "@/components";
import { AuthService, StarService, StarType } from "@keekijanai/frontend-core";
import {
  SentimentSatisfiedOutlined,
  SentimentNeutralOutlined,
  SentimentDissatisfiedOutlined,
} from "@mui/icons-material";
import { useObservableEagerState } from "observable-hooks";
import { useCallback } from "react";
import { showAuthModal } from "..";

export interface StarProps {
  belong: string;
}

const StarContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

const starConfig = [
  {
    type: StarType.Good,
    Icon: SentimentSatisfiedOutlined,
  },
  {
    type: StarType.JustOK,
    Icon: SentimentNeutralOutlined,
  },
  {
    type: StarType.Bad,
    Icon: SentimentDissatisfiedOutlined,
  },
];

export const Star = ({ belong }: StarProps) => {
  const authService = useService(AuthService);
  const starService = useService(StarService, belong);

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
    <StarContainer>
      <Statical value={star?.total} />
      <div>
        {starConfig.map(({ type, Icon }, index) => (
          <IconButton
            key={index}
            color={type === star?.current ? "primary" : undefined}
            onClick={handleClickStar(type)}
          >
            <Icon />
          </IconButton>
        ))}
      </div>
    </StarContainer>
  );
};
