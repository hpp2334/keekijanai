import { createNonNullContext } from "@/common/react";
import React, { useEffect, useMemo, useRef } from "react";
import { useCommentService } from "./logic";
import { CommentService } from "@keekijanai/frontend-core";

interface CommentContextValue {
  commentService: CommentService;
}

type InternalCommentContextProps = React.PropsWithChildren<{
  belong: string;
}>;

const [internalCommentContext, useInternalCommentContext] = createNonNullContext<CommentContextValue>();

export { useInternalCommentContext };

export const InternalCommentContext = ({ belong, children }: InternalCommentContextProps) => {
  const commentService = useCommentService(belong);

  const ctxValue: CommentContextValue = useMemo(
    () => ({
      commentService,
    }),
    [commentService]
  );

  return <internalCommentContext.Provider value={ctxValue}>{children}</internalCommentContext.Provider>;
};
