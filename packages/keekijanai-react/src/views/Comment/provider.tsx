import { createNonNullContext } from "@/common/react";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useCommentService } from "./logic";
import { CommentService } from "@keekijanai/frontend-core";
import { useGlobalService } from "../Global";
import { nextFrame } from "@/common/helper";

interface CommentContextValue {
  commentService: CommentService;
  commentPostElRef: React.RefObject<HTMLDivElement>;
  scrollToPost: () => void;
}

type InternalCommentContextProps = React.PropsWithChildren<{
  belong: string;
}>;

const [internalCommentContext, useInternalCommentContext] = createNonNullContext<CommentContextValue>();

export { useInternalCommentContext };

export const InternalCommentContext = ({ belong, children }: InternalCommentContextProps) => {
  const globalService = useGlobalService();
  const commentService = useCommentService(belong);
  const commentPostElRef = useRef<HTMLDivElement>(null);

  const scrollToPost = useCallback(() => {
    nextFrame(() => {
      const postEl = commentPostElRef.current;
      if (postEl) {
        globalService.scrollTo(postEl, {
          offset: -300,
        });
      }
    });
  }, [globalService]);

  const ctxValue: CommentContextValue = useMemo(
    () => ({
      commentService,
      commentPostElRef,
      scrollToPost,
    }),
    [commentService, scrollToPost]
  );

  return <internalCommentContext.Provider value={ctxValue}>{children}</internalCommentContext.Provider>;
};
