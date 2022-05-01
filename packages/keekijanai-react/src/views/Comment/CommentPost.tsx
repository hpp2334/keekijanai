import React, { useCallback, useMemo, useRef } from "react";
import { CommentEditor } from "./components/CommentEditor";
import { styled } from "@/components";
import { useTranslation } from "@/common/i18n";
import { useRefreshToken } from "@/common/helper";
import { switchTap, TreeComment } from "@keekijanai/frontend-core";
import { firstValueFrom } from "rxjs";
import { sprintf } from "sprintf-js";
import { useInternalCommentContext } from "./provider";

export interface CommentPostProps {
  refComment?: TreeComment;

  defaultExpand?: boolean;
  expand?: boolean;
  onExpandChange?: (expand: boolean) => void;
}

const CommentToPostUnfocusContainer = styled("div")(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: theme.palette.grey[200],
  color: theme.palette.grey[400],
}));

export const CommentPost = ({ ...leftProps }: CommentPostProps) => {
  const { t } = useTranslation("Comment");
  const [_token, refreshToken] = useRefreshToken();
  const { commentService: service } = useInternalCommentContext();

  const placeholder = leftProps.refComment
    ? sprintf(t("post.reply.placeholder"), leftProps.refComment.user?.name)
    : t("post.create.placeholder");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isControlled = useMemo(() => leftProps.expand !== undefined, []);
  const innerExpandRef = useRef((isControlled ? leftProps.expand : leftProps.defaultExpand) ?? false);
  const innerChangeExpandRef = useRef(
    isControlled
      ? leftProps.onExpandChange
      : (next: boolean) => {
          innerExpandRef.current = next;
        }
  );
  if (isControlled) {
    innerExpandRef.current = leftProps.expand ?? false;
    innerChangeExpandRef.current = leftProps.onExpandChange;
  }

  const handleExpand = useCallback(() => {
    innerChangeExpandRef.current?.(true);
    refreshToken();
  }, [refreshToken]);

  const handleCollapse = useCallback(() => {
    innerChangeExpandRef.current?.(false);
    refreshToken();
  }, [refreshToken]);

  const handleReply = useCallback(
    (value: string) => {
      const observable = service
        .create(
          {
            content: value,
          },
          leftProps.refComment ?? null
        )
        .pipe(
          switchTap(() => {
            handleCollapse();
          })
        );
      return firstValueFrom(observable);
    },
    [handleCollapse, leftProps.refComment, service]
  );

  return (
    <div>
      {innerExpandRef.current ? (
        <CommentEditor onCancel={handleCollapse} onReply={handleReply} placeholder={placeholder} />
      ) : (
        <CommentToPostUnfocusContainer onClick={handleExpand}>{placeholder}</CommentToPostUnfocusContainer>
      )}
    </div>
  );
};
