import { ButtonUnstyled, CircularProgress, IconButton, useTheme, styled } from "@/components";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import React, { useEffect, useMemo, useRef } from "react";
import { useObservableState } from "observable-hooks";
import Color from "color";
import clsx from "clsx";
import { useReadingProgressService } from "./logic";
import { useGlobalService } from "../Global";
import { isNil } from "@keekijanai/frontend-core";

export interface ReadingProgressProps {
  className?: string;
}

const ReadingProgressContainer = styled("div")({
  position: "relative",
  // prevent screen scroll
  touchAction: "none",
  zIndex: 1,
});

const StyledCircularProgressContainer = styled("div")({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
});

const StyledCircularProgress = styled(CircularProgress)({
  verticalAlign: "bottom",
});

const ToTopButton = styled(ButtonUnstyled)(({ theme }) => {
  const mainColor = Color(theme.palette.primary.main);
  const size = 38;

  return {
    position: "relative",
    backgroundColor: mainColor.darken(0.3).hex(),
    color: theme.palette.primary.contrastText,
    zIndex: 1,
    borderRadius: "50%",
    width: size,
    height: size,
    outline: "none",
    border: "none",
    transition: "background-color 0.2s",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: mainColor.darken(0.1).hex(),
    },
  };
});

export const CircularReadingProgress = ({ className }: ReadingProgressProps) => {
  const readingProgressService = useReadingProgressService();
  const globalService = useGlobalService();
  const containerRef = useRef<HTMLDivElement>(null);

  const progress = useObservableState(readingProgressService.progress$, 0);

  useEffect(() => {
    const _document = globalService.global?.document;
    if (isNil(_document)) {
      return;
    }
    const document = _document;

    const _current = containerRef.current;
    if (!isNil(_current)) {
      const current = _current;
      const computedStyle = getComputedStyle(current);
      current.style.position = "fixed";

      current.style.right = computedStyle.right;
      current.style.bottom = computedStyle.bottom;

      type MoveHandler = (
        ev: {
          clientX: number;
          clientY: number;
          prevClientX: number;
          prevClientY: number;
          stopPropagation: () => void;
        },
        updatePos: (pos: [number, number]) => void
      ) => void;

      const registerMouseMoveHandler = (moveHandler: MoveHandler): void => {
        current.addEventListener("mousedown", (ev) => {
          let [oldX, oldY] = [ev.clientX, ev.clientY];
          const [prevX, prevY] = [oldX, oldY];

          const updatePos = (pos: [number, number]) => {
            oldX = pos[0];
            oldY = pos[1];
          };
          function handleMouseMove(ev: MouseEvent) {
            moveHandler(
              {
                clientX: ev.clientX,
                clientY: ev.clientY,
                prevClientX: oldX,
                prevClientY: oldY,
                stopPropagation: ev.stopPropagation.bind(ev),
              },
              updatePos
            );
          }
          function handleMouseUp(ev: MouseEvent) {
            const [newX, newY] = [ev.clientX, ev.clientY];
            const moved = Math.abs(newX - prevX) > 1 || Math.abs(newY - prevY) > 1;
            if (moved) {
              ev.stopPropagation();
            }

            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp, {
              capture: true,
            });
          }

          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp, {
            capture: true,
          });
        });
      };
      const registerTouchMoveHandler = (moveHandler: MoveHandler): void => {
        const getPosFromTouchEvent = (ev: TouchEvent): [number, number] | null => {
          if (ev.touches.length === 0) {
            return null;
          }

          const touch = ev.touches[0];
          return [touch.clientX, touch.clientY];
        };
        current.addEventListener("touchstart", (ev) => {
          const pos = getPosFromTouchEvent(ev);
          if (isNil(pos)) {
            return;
          }
          let [oldX, oldY] = pos;
          const [initX, initY] = [oldX, oldY];

          const updatePos = (pos: [number, number]) => {
            oldX = pos[0];
            oldY = pos[1];
          };
          function handleTouchMove(ev: TouchEvent) {
            const pos = getPosFromTouchEvent(ev);
            if (isNil(pos)) {
              return;
            }
            moveHandler(
              {
                clientX: pos[0],
                clientY: pos[1],
                prevClientX: oldX,
                prevClientY: oldY,
                stopPropagation: ev.stopPropagation.bind(ev),
              },
              updatePos
            );
          }
          function handleTouchEnd(ev: TouchEvent) {
            const moved = Math.abs(oldX - initX) > 1 || Math.abs(oldY - initY) > 1;
            if (moved) {
              ev.stopPropagation();
            }

            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd, {
              capture: true,
            });
          }

          document.addEventListener("touchmove", handleTouchMove);
          document.addEventListener("touchend", handleTouchEnd, {
            capture: true,
          });
        });
      };
      const moveHandler: MoveHandler = (ev, updatePos) => {
        const [newX, newY] = [ev.clientX, ev.clientY];

        current.style.right = `${parseInt(current.style.right) - (ev.clientX - ev.prevClientX)}px`;
        current.style.bottom = `${parseInt(current.style.bottom) - (ev.clientY - ev.prevClientY)}px`;
        updatePos([newX, newY]);
      };
      registerMouseMoveHandler(moveHandler);
      registerTouchMoveHandler(moveHandler);
    }
  }, []);

  return (
    <div className={clsx(className)} ref={containerRef}>
      <ReadingProgressContainer>
        <ToTopButton onMouseUp={globalService.toTop}>
          <ArrowUpwardIcon />
        </ToTopButton>
        <StyledCircularProgressContainer>
          <StyledCircularProgress size={44} variant="determinate" value={progress * 100} color={"primary"} />
        </StyledCircularProgressContainer>
      </ReadingProgressContainer>
    </div>
  );
};
