import styles from "./comment.module.scss";
import React, { useCallback, useMemo, useRef } from "react";
import { CommentEditor } from "./CommentEditor";
import { useTranslation } from "@/common/i18n";
import { nextFrame, useRefreshToken } from "@/common/helper";
import { CommentTree, switchTap } from "@keekijanai/frontend-core";
import { firstValueFrom } from "rxjs";
import { sprintf } from "sprintf-js";
import { useInternalCommentContext } from "./provider";
import { injectCSS } from "@/common/styles";
import { useGlobalService } from "../Global";
import { deserializeToValue } from "./editor";
import { toPlainText } from "./editor/util";

export interface CommentPostProps {
  refComment?: CommentTree;
  refRoot?: React.RefObject<HTMLDivElement>;
  defaultExpand?: boolean;
  expand?: boolean;
  onExpandChange?: (expand: boolean) => void;
}

const CommentToPostUnfocusContainer = injectCSS("div", styles.commentToPostUnfocusContainer);

export const CommentPost = ({ ...props }: CommentPostProps) => {
  const { t } = useTranslation("Comment");
  const [_token, refreshToken] = useRefreshToken();
  const { commentService: service, scrollToPost } = useInternalCommentContext();

  const placeholder = useMemo(() => {
    if (!props.refComment) {
      return t("post.create.placeholder");
    }
    const deValue = deserializeToValue(props.refComment.data.content);
    const plainText = toPlainText(deValue);
    return sprintf(t("post.reply.placeholder"), props.refComment.data.user?.name, plainText);
  }, [props.refComment, t]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isControlled = useMemo(() => props.expand !== undefined, []);
  const innerExpandRef = useRef((isControlled ? props.expand : props.defaultExpand) ?? false);
  const innerChangeExpandRef = useRef(
    isControlled
      ? props.onExpandChange
      : (next: boolean) => {
          innerExpandRef.current = next;
        }
  );
  if (isControlled) {
    innerExpandRef.current = props.expand ?? false;
    innerChangeExpandRef.current = props.onExpandChange;
  }

  const handleExpand = useCallback(() => {
    innerChangeExpandRef.current?.(true);
    scrollToPost();
    refreshToken();
  }, [refreshToken, scrollToPost]);

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
          props.refComment ?? null,
          !props.refComment ? null : props.refComment.isRoot ? props.refComment : props.refComment.parent
        )
        .pipe(
          switchTap(() => {
            handleCollapse();
          })
        );
      return firstValueFrom(observable);
    },
    [handleCollapse, props.refComment, service]
  );

  return (
    <div ref={props.refRoot} className={styles.commentPostRoot}>
      {innerExpandRef.current ? (
        <CommentEditor onCancel={handleCollapse} onReply={handleReply} placeholder={placeholder} />
      ) : (
        <CommentToPostUnfocusContainer onClick={handleExpand}>{placeholder}</CommentToPostUnfocusContainer>
      )}
    </div>
  );
};
