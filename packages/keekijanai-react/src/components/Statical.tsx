import { styled } from "./reexport-mui";
import React from "react";
import { animated, useTransition } from "react-spring";

const StaticalDivWrapper = styled("div")(({ theme }) => ({
  position: "relative",
  height: theme.typography.h4.fontSize,
  width: "100%",
  overflow: "hidden",
}));

const StaticalDiv = styled(animated.div)(({ theme }) => ({
  position: "absolute",
  fontSize: theme.typography.h4.fontSize,
  left: "50%",
  top: "50%",
  cursor: "default",
  userSelect: "none",
}));

export const Statical = ({ value }: { value: string | number | null | undefined }) => {
  const text = value ?? "-";
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
    <StaticalDivWrapper>
      {transitions((style, item) => (
        <StaticalDiv style={{ ...style }}>{item}</StaticalDiv>
      ))}
    </StaticalDivWrapper>
  );
};
