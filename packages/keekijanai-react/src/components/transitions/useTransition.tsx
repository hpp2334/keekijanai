import { useRefreshToken } from "@/common/helper";
import React from "react";
import { useRef, useCallback, useEffect } from "react";

declare const setTimeout: typeof window.setTimeout;

export enum TransitionStateType {
  From,
  Enter,
  Leave,
}

export interface TransitionItem {
  type: TransitionStateType;
  key: string | number;
  element: any;
  lastCancelTimerId: number | null;
}

export function useTransition<T>(
  key: string | number,
  element: T,
  config: {
    transitions: Record<"from" | "enter" | "leave", string>;
    durationMs: number;
  }
) {
  const configRef = useRef(config);
  const transitionItemMapRef = useRef(new Map<string | number, TransitionItem>());
  const [token, refreshToken] = useRefreshToken();
  const scheduledCallRefreshToken = useRef(false);

  const getClassNameFromItem = useCallback((item: TransitionItem) => {
    const transitions = configRef.current.transitions;
    switch (item.type) {
      case TransitionStateType.From:
        return transitions.from;
      case TransitionStateType.Enter:
        return transitions.enter;
      case TransitionStateType.Leave:
        return transitions.leave;
      default:
        return "";
    }
  }, []);

  useEffect(() => {
    const transitionMap = transitionItemMapRef.current;
    if (!transitionMap.has(key)) {
      transitionMap.set(key, {
        type: TransitionStateType.From,
        key,
        element,
        lastCancelTimerId: null,
      });
      scheduledCallRefreshToken.current = true;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const item = transitionMap.get(key)!;
      if (item.type === TransitionStateType.From) {
        item.type = TransitionStateType.Enter;
        scheduledCallRefreshToken.current = true;
      } else if (item.type === TransitionStateType.Leave) {
        item.type = TransitionStateType.Enter;
        if (item.lastCancelTimerId !== null) {
          clearTimeout(item.lastCancelTimerId);
          item.lastCancelTimerId = null;
        }
        scheduledCallRefreshToken.current = true;
      }
    }
    if (scheduledCallRefreshToken.current) {
      refreshToken();
      scheduledCallRefreshToken.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, token]);

  useEffect(() => {
    const transitionMap = transitionItemMapRef.current;
    const config = configRef.current;

    return () => {
      const item = transitionMap.get(key);
      // Unreachable in theory
      if (!item) {
        return;
      }

      if (item.type !== TransitionStateType.Leave) {
        item.type = TransitionStateType.Leave;
        item.lastCancelTimerId = setTimeout(() => {
          if (item.type === TransitionStateType.Leave) {
            transitionMap.delete(item.key);
          }
        }, config.durationMs);
        scheduledCallRefreshToken.current = true;
      }
    };
  }, [key]);

  const transition = useCallback(
    (render: (className: string, item: T) => React.ReactElement) => {
      return (
        <>
          {[...transitionItemMapRef.current.values()]
            .sort((a, b) => String(a.key).localeCompare(String(b.key)))
            .map((item, index) => (
              <React.Fragment key={item.key}>{render(getClassNameFromItem(item), item.element)}</React.Fragment>
            ))}
        </>
      );
    },
    [getClassNameFromItem]
  );

  return transition;
}
