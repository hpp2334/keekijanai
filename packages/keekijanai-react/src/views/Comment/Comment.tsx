import { CommentService, CommentTree, CommentVO, TreeComment } from "@keekijanai/frontend-core";
import { useService } from "@/common/service/useService";
import { Typography, Avatar, Button, Stack, Popover, styled } from "@/components";
import { useTranslation } from "react-i18next";
import { CommentPost } from "./CommentPost";
import { useObservableEagerState } from "observable-hooks";
import { firstValueFrom } from "rxjs";
import { CommentProvider, useCommentService } from "./provider";
import { CommentEditor } from "./components/CommentEditor";
import React, { useCallback, useContext, useImperativeHandle, useMemo, useState } from "react";
import { noop } from "lodash-es";
import { CommentTime } from "./CommentTime";
import { useRemote } from "@/common/hooks/useRemote";
import { StateType } from "@/common/state";
import { ConfirmPopover } from "@/components/ConfirmPopover";
import { showAuthModal, useAuthService } from "../Auth";

export interface CommentProps {
  belong: string;
}

const CommentHeaderText = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.h5.fontSize,
}));

const CommentHeaderCount = styled("div")(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  backgroundColor: theme.palette.primary.main,
  borderRadius: 10,
  height: 20,
  fontSize: 14,
  display: "flex",
  padding: theme.spacing(1),
  justifyContent: "center",
  alignItems: "center",
}));

const CommentUserText = styled(Typography)({
  fontWeight: 550,
});

const CommentLeavesWrapper = styled("div")({
  marginLeft: 30,
});

const CommentButton = styled("div")(({ theme }) => ({
  display: "inline-block",
  cursor: "pointer",
  color: theme.palette.grey[800],
  fontSize: theme.typography.button.fontSize,
  "&:hover": {
    color: theme.palette.grey[900],
  },
}));

const CommentEmptyContent = styled("div")(({ theme }) => ({
  padding: `20px 0`,
}));

const CommentEmptyText = styled(Typography)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  color: theme.palette.text.secondary,
}));

const RemoveCommentContentContainer = styled("div")(({ theme }) => ({
  padding: theme.spacing(1),
}));

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
      {t("loadmore", { ns: "Comment" })}
    </Button>
  );
};

const CommentBlock = ({ comment }: { comment: TreeComment }) => {
  const content = comment.content;
  const { t } = useTranslation("Comment");
  const hasLeaves = comment.child_count > 0;

  const { toReply } = useContext(commentInnerContext);
  const service = useCommentService();

  const handleClickReply = useCallback(() => {
    toReply({
      refComment: comment,
    });
  }, [comment, toReply]);

  const handleClickRemove = useCallback(() => {
    const id = comment.id;
    return firstValueFrom(service.remove(id));
  }, [comment.id, service]);

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={2}>
        <Avatar src={comment.user?.avatar_url}></Avatar>
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1}>
            <CommentUserText>{comment.user?.name}</CommentUserText>
            <CommentTime timestamp={comment.created_time} />
          </Stack>
          <CommentEditor initialValue={content} mode="read" />
          <Stack direction="row" spacing={1}>
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
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
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
  const { t } = useTranslation("Comment");
  const comments = commentTree.data;
  const service = useCommentService();

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
    <CommentEmptyContent>
      <CommentEmptyText>{t("empty.title")}</CommentEmptyText>
    </CommentEmptyContent>
  );
}

const CommentRoots = ({ commentTree }: { commentTree: CommentTree }) => {
  const hasComments = commentTree.data.length > 0;
  const service = useCommentService();
  const loadMore = useCallback(() => {
    return firstValueFrom(service.loadMoreRoot());
  }, [service]);

  return (
    <div>
      {hasComments && (
        <Stack spacing={2}>
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

const CommentInner = () => {
  const { t } = useTranslation("Comment");
  const commentService = useCommentService();
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
      } else {
        showAuthModal();
      }
    },
    [authService]
  );

  const ctxValue = useMemo(
    () => ({
      toReply,
    }),
    [toReply]
  );

  console.debug("[React][Comment]", {
    commentTree,
  });

  return (
    <div>
      <commentInnerContext.Provider value={ctxValue}>
        <Stack direction="column" spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CommentHeaderText>{t("header", { ns: "Comment" })}</CommentHeaderText>
            <CommentHeaderCount>{commentTree?.pagination.total ?? "-"}</CommentHeaderCount>
          </Stack>
          {!commentTree && <CommentLoading />}
          {commentTree && <CommentRoots commentTree={commentTree} />}
          <CommentPost
            expand={commentPostState.expand}
            onExpandChange={handleCommentPostExpandChange}
            refComment={commentPostState.refComment}
          />
        </Stack>
      </commentInnerContext.Provider>
    </div>
  );
};

export const Comment = ({ belong }: CommentProps) => {
  return (
    <CommentProvider args={[belong]}>
      <CommentInner />
    </CommentProvider>
  );
};
