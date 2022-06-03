import styles from "./comment.module.scss";
import { CommentService, CommentTree, CommentVO, noop, TreeComment } from "@keekijanai/frontend-core";
import { Typography, Avatar, Button, Stack } from "@/components";
import { useAutoUpdateResource, useTranslation } from "@/common/i18n";
import { CommentPost } from "./CommentPost";
import { useObservableEagerState } from "observable-hooks";
import { firstValueFrom } from "rxjs";
import { InternalCommentContext, useInternalCommentContext } from "./provider";
import { CommentEditor, CommentEditorMode } from "./CommentEditor";
import React, { useCallback, useContext, useImperativeHandle, useMemo, useRef, useState } from "react";
import { CommentTime } from "./CommentTime";
import { useRemote } from "@/common/hooks/useRemote";
import { StateType } from "@/common/state";
import { ConfirmPopover } from "@/components/ConfirmPopover";
import { showAuthModal } from "../Auth";
import { withNoSSR } from "@/common/hoc/withNoSSR";
import { useAuthService } from "../Auth/logic";
import { withCSSBaseline } from "@/common/hoc/withCSSBaseline";
import { composeHOC } from "@/common/hoc/composeHOC";
import { injectCSS } from "@/common/styles";
import { useGlobalService } from "../Global";
import { nextFrame } from "@/common/helper";

interface CommentInnerProps {
  maxHeight?: number;
  headerSuffix?: React.ReactNode;
}

export interface CommentProps extends CommentInnerProps {
  belong: string;
}

const CommentHeaderRoot = injectCSS("div", styles.commentHeaderRoot);
const CommentHeaderText = injectCSS(Typography, styles.text);
const CommentHeaderCount = injectCSS("div", styles.count);
const CommentBodyRoot = injectCSS("div", styles.commentBodyRoot);
const CommentUserText = injectCSS(Typography, styles.commentUserText);
const CommentLeavesWrapper = injectCSS("div", styles.commentLeavesWrapper);
const CommentButton = injectCSS("button", styles.commentButton);
const RemoveCommentContentContainer = injectCSS("div", styles.commentRemoveContentContainer);

const commentInnerContext = React.createContext<{
  toReply: (params: { refComment?: TreeComment }) => void;
}>({
  toReply: noop,
});

const CommentLoadMoreButton = ({ handler }: { handler: () => Promise<unknown> }) => {
  const { t } = useTranslation("Comment");
  const [remoteState, loadMore] = useRemote(handler);

  return (
    <Button disabled={remoteState.type === StateType.Loading} onClick={loadMore}>
      {t("loadmore")}
    </Button>
  );
};

const CommentBlock = ({ comment }: { comment: TreeComment }) => {
  const globalService = useGlobalService();
  const { t } = useTranslation("Comment");
  const content = comment.content;
  const hasLeaves = comment.child_count > 0;

  const { toReply } = useContext(commentInnerContext);
  const { commentService: service } = useInternalCommentContext();

  const handleClickReply = useCallback(() => {
    toReply({
      refComment: comment,
    });
  }, [comment, globalService, toReply]);

  const handleClickRemove = useCallback(() => {
    const id = comment.id;
    return firstValueFrom(service.remove(id));
  }, [comment.id, service]);

  return (
    <Stack spacing={4}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Avatar src={comment.user?.avatar_url}></Avatar>
        <Stack spacing={2}>
          <Stack direction="row" spacing={3}>
            <CommentUserText>{comment.user?.name}</CommentUserText>
            <CommentTime timestamp={comment.created_time} />
          </Stack>
          <CommentEditor initialValue={content} mode={CommentEditorMode.Read} />
          <Stack direction="row" spacing={3}>
            <CommentButton onClick={handleClickReply}>{t("block.panel.reply")}</CommentButton>
            {service.canRemove(comment) && (
              <ConfirmPopover
                trigger={(openPopover) => (
                  <CommentButton onClick={(ev) => openPopover(ev.currentTarget)}>
                    {t("block.panel.remove")}
                  </CommentButton>
                )}
                onOk={handleClickRemove}
                texts={{
                  ok: t("remove.confirm.button.ok"),
                  cancel: t("remove.confirm.button.cancel"),
                }}
                placement="top-start"
              >
                <RemoveCommentContentContainer>
                  <Typography>{t("remove.confirm.content")}</Typography>
                </RemoveCommentContentContainer>
              </ConfirmPopover>
            )}
          </Stack>
        </Stack>
      </Stack>
      {hasLeaves && (
        <div>
          <CommentLeavesWrapper>
            <CommentLeaves commentTree={comment.children} root={comment} />
          </CommentLeavesWrapper>
        </div>
      )}
    </Stack>
  );
};

function CommentLeaves({ commentTree, root }: { commentTree: CommentTree; root: TreeComment }) {
  const comments = commentTree.data;
  const { commentService: service } = useInternalCommentContext();

  const loadMore = useCallback(() => {
    return firstValueFrom(service.loadMoreLeaves(root));
  }, [root, service]);

  return (
    <div>
      <Stack spacing={2}>
        {comments.map((comment) => (
          <CommentBlock key={comment.id} comment={comment} />
        ))}
      </Stack>
      {commentTree.pagination.has_more && (
        <div>
          <CommentLoadMoreButton handler={loadMore} />
        </div>
      )}
    </div>
  );
}

function CommentLoading() {
  return null;
}

function CommentEmpty() {
  const { t } = useTranslation("Comment");
  return (
    <div className={styles.commentEmptyRoot}>
      <div className={styles.text}>{t("empty.title")}</div>
    </div>
  );
}

const CommentRoots = ({ commentTree }: { commentTree: CommentTree }) => {
  const hasComments = commentTree.data.length > 0;
  const { commentService: service } = useInternalCommentContext();
  const loadMore = useCallback(() => {
    return firstValueFrom(service.loadMoreRoot());
  }, [service]);

  return (
    <div>
      {hasComments && (
        <Stack spacing={4}>
          {commentTree.data.map((comment) => (
            <CommentBlock key={comment.id} comment={comment} />
          ))}
        </Stack>
      )}
      {!hasComments && <CommentEmpty />}
      {commentTree.pagination.has_more && (
        <div>
          <CommentLoadMoreButton handler={loadMore} />
        </div>
      )}
    </div>
  );
};

const CommentInner = ({ maxHeight, headerSuffix }: CommentInnerProps) => {
  const { t } = useTranslation("Comment");
  const { commentService, commentPostElRef, scrollToPost } = useInternalCommentContext();
  const authService = useAuthService();

  const commentTree = useObservableEagerState(commentService.commentTree$);

  const [commentPostState, setCommentPostState] = useState<{ expand: boolean; refComment: TreeComment | undefined }>({
    expand: false,
    refComment: undefined,
  });

  const handleCommentPostExpandChange = useCallback(
    (expand: boolean) => {
      if (expand && !authService.isLogin()) {
        showAuthModal();
        return;
      }
      setCommentPostState({ expand, refComment: undefined });
    },
    [authService]
  );

  const toReply = useCallback(
    (params: { refComment?: TreeComment }) => {
      if (authService.isLogin()) {
        setCommentPostState({
          expand: true,
          refComment: params.refComment,
        });
        scrollToPost();
      } else {
        showAuthModal();
      }
    },
    [authService, scrollToPost]
  );

  const ctxValue = useMemo(
    () => ({
      toReply,
    }),
    [toReply]
  );

  const commentBodyStyle = useMemo(() => {
    const style: React.CSSProperties = {};
    if (maxHeight) {
      style.maxHeight = maxHeight;
      style.overflowY = "auto";
    }
    return style;
  }, [maxHeight]);

  console.debug("[React][Comment]", {
    commentTree,
  });

  return (
    <div className={styles.commentRoot}>
      <commentInnerContext.Provider value={ctxValue}>
        <Stack direction="column" spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <CommentHeaderRoot>
              <Stack direction="row" spacing={1} alignItems="center">
                <CommentHeaderText>{t("header")}</CommentHeaderText>
                <CommentHeaderCount>{commentTree?.pagination.total ?? "-"}</CommentHeaderCount>
              </Stack>
            </CommentHeaderRoot>
            {headerSuffix}
          </Stack>
          <CommentBodyRoot style={commentBodyStyle}>
            {!commentTree && <CommentLoading />}
            {commentTree && <CommentRoots commentTree={commentTree} />}
          </CommentBodyRoot>
          <CommentPost
            expand={commentPostState.expand}
            onExpandChange={handleCommentPostExpandChange}
            refComment={commentPostState.refComment}
            refRoot={commentPostElRef}
          />
        </Stack>
      </commentInnerContext.Provider>
    </div>
  );
};

const withFeature = composeHOC(withNoSSR, withCSSBaseline);

export const Comment = withFeature(({ belong, ...leftProps }: CommentProps) => {
  useAutoUpdateResource("Comment", (lang) => import(`./locales/${lang}.json`));

  return (
    <InternalCommentContext belong={belong}>
      <CommentInner {...leftProps} />
    </InternalCommentContext>
  );
});
