import { useService } from "@/common/service/useService";
import { IconButton, Typography, styled } from "@/components";
import { AuthService, StarService, StarType } from "@keekijanai/frontend-core";
import {
  SentimentSatisfiedOutlined,
  SentimentNeutralOutlined,
  SentimentDissatisfiedOutlined,
} from "@mui/icons-material";
import { useObservableEagerState, useObservableState } from "observable-hooks";
import { useCallback } from "react";
import { useSpring, animated, useTransition } from "react-spring";
import { showAuthModal } from "..";

export interface StarProps {
  belong: string;
}

const StarContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

const StarTextDivWrapper = styled("div")(({ theme }) => ({
  position: "relative",
  height: theme.typography.h4.fontSize,
  width: "100%",
  overflow: "hidden",
}));

const StarTextDiv = styled(animated.div)(({ theme }) => ({
  position: "absolute",
  fontSize: theme.typography.h4.fontSize,
  left: "50%",
  top: "50%",
}));

const StarText = ({ value }: { value: number | null | undefined }) => {
  const text = value ?? 0;
  const transitions = useTransition(text, {
    from: {
      transform: "translateX(-50%) translateY(50%)",
    },
    enter: {
      transform: "translateX(-50%) translateY(-50%)",
    },
    leave: {
      transform: "translateX(-50%) translateY(-150%)",
    },
  });

  return (
    <StarTextDivWrapper>
      {transitions((style, item) => (
        <StarTextDiv style={{ ...style }}>{item}</StarTextDiv>
      ))}
    </StarTextDivWrapper>
  );
};

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
    []
  );

  console.debug("[React][Star]", { star });

  return (
    <StarContainer>
      <StarText value={star?.total} />
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
