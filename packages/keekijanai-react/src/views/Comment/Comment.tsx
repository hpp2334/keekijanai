import styles from "./comment.module.scss";
import {
  CommentService,
  CommentVO,
  CommentTree,
  CommentTreeRoot,
  noop,
  ReferenceCommentVO,
} from "@keekijanai/frontend-core";
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
import { useUncachedObservableEagerState } from "@/common/hooks/useObservable";
import clsx from "clsx";

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
  toReply: (params: { refComment?: CommentTree }) => void;
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

const ReferenceCommentBlock = ({
  referenceComment,
  className,
}: {
  referenceComment: ReferenceCommentVO;
  className?: string;
}) => {
  return (
    <div className={clsx(styles.referenceCommentRoot, className)}>
      <Typography className={styles.userName}>{referenceComment.user.name}</Typography>
      <CommentEditor
        classes={{ root: styles.content }}
        initialValue={referenceComment.content}
        mode={CommentEditorMode.Read}
      />
    </div>
  );
};

const CommentBlock = ({ commentTree }: { commentTree: CommentTree }) => {
  const { t } = useTranslation("Comment");
  const comment = commentTree.data;
  const content = comment.content;
  const hasLeaves = comment.child_count > 0;

  const { toReply } = useContext(commentInnerContext);
  const { commentService: service } = useInternalCommentContext();

  const handleClickReply = useCallback(() => {
    toReply({
      refComment: commentTree,
    });
  }, [commentTree, toReply]);

  const handleClickRemove = useCallback(() => {
    return firstValueFrom(service.remove(commentTree));
  }, [commentTree, service]);

  return (
    <Stack spacing={4}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Avatar src={comment.user?.avatar_url}></Avatar>
        <Stack spacing={3}>
          <Stack direction="row" spacing={3}>
            <CommentUserText>{comment.user?.name}</CommentUserText>
            <CommentTime timestamp={comment.created_time} />
          </Stack>
          {comment.reference_comment && comment.reference_comment.id !== comment.parent_id && (
            <ReferenceCommentBlock referenceComment={comment.reference_comment} />
          )}
          <CommentEditor initialValue={content} mode={CommentEditorMode.Read} />
          <Stack direction="row" spacing={3}>
            <CommentButton onClick={handleClickReply}>{t("block.panel.reply")}</CommentButton>
            {comment.can_remove && (
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
            <CommentLeaves commentTree={commentTree} />
          </CommentLeavesWrapper>
        </div>
      )}
    </Stack>
  );
};

function CommentLeaves({ commentTree }: { commentTree: CommentTree }) {
  const subCommentTrees = commentTree.children;
  const { commentService: service } = useInternalCommentContext();

  const loadMore = useCallback(() => {
    return firstValueFrom(service.loadMoreLeaves(commentTree));
  }, [commentTree, service]);

  return (
    <div>
      <Stack spacing={4}>
        {subCommentTrees.map((commentTree, index) => (
          <CommentBlock key={index} commentTree={commentTree} />
        ))}
        {commentTree.paginationQuery.hasUnloadForwardChildren && <CommentLoadMoreButton handler={loadMore} />}
      </Stack>
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

const CommentRoots = ({ commentTreeRoot }: { commentTreeRoot: CommentTreeRoot }) => {
  const hasComments = commentTreeRoot.roots.length > 0;
  const { commentService: service } = useInternalCommentContext();

  const loadMore = useCallback(() => {
    return firstValueFrom(service.loadMoreTree());
  }, [service]);

  return (
    <div>
      {hasComments && (
        <Stack spacing={4}>
          {commentTreeRoot.roots.map((comment) => (
            <CommentBlock key={comment.id} commentTree={comment} />
          ))}
          {commentTreeRoot.hasUnloadRoots && <CommentLoadMoreButton handler={loadMore} />}
        </Stack>
      )}
      {!hasComments && <CommentEmpty />}
    </div>
  );
};

const CommentInner = ({ maxHeight, headerSuffix }: CommentInnerProps) => {
  const { t } = useTranslation("Comment");
  const { commentService, commentPostElRef, scrollToPost } = useInternalCommentContext();
  const authService = useAuthService();

  const commentTreeRoot = useUncachedObservableEagerState(commentService.commentTreeRoot$);

  const [commentPostState, setCommentPostState] = useState<{
    expand: boolean;
    refComment: CommentTree | undefined;
  }>({
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
    (params: { refComment?: CommentTree }) => {
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
    commentTree: commentTreeRoot,
  });

  return (
    <div className={styles.commentRoot}>
      <commentInnerContext.Provider value={ctxValue}>
        <Stack direction="column" spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <CommentHeaderRoot>
              <Stack direction="row" spacing={1} alignItems="center">
                <CommentHeaderText>{t("header")}</CommentHeaderText>
                <CommentHeaderCount>{commentTreeRoot?.total ?? "-"}</CommentHeaderCount>
              </Stack>
            </CommentHeaderRoot>
            {headerSuffix}
          </Stack>
          <CommentBodyRoot style={commentBodyStyle}>
            {!commentTreeRoot && <CommentLoading />}
            {commentTreeRoot && <CommentRoots commentTreeRoot={commentTreeRoot} />}
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
