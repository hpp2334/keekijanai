import styles from "./comment.module.scss";
import React, { useCallback, useMemo, useRef } from "react";
import { CommentEditor } from "./CommentEditor";
import { useTranslation } from "@/common/i18n";
import { useRefreshToken } from "@/common/helper";
import { switchTap, TreeComment } from "@keekijanai/frontend-core";
import { firstValueFrom } from "rxjs";
import { sprintf } from "sprintf-js";
import { useInternalCommentContext } from "./provider";
import { injectCSS } from "@/common/styles";

export interface CommentPostProps {
  refComment?: TreeComment;

  defaultExpand?: boolean;
  expand?: boolean;
  onExpandChange?: (expand: boolean) => void;
}

const CommentToPostUnfocusContainer = injectCSS("div", styles.commentToPostUnfocusContainer);

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
    <div className={styles.commentPostRoot}>
      {innerExpandRef.current ? (
        <CommentEditor onCancel={handleCollapse} onReply={handleReply} placeholder={placeholder} />
      ) : (
        <CommentToPostUnfocusContainer onClick={handleExpand}>{placeholder}</CommentToPostUnfocusContainer>
      )}
    </div>
  );
};
