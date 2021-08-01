import React from "react";
import { Comment as TypeComment } from "keekijanai-type";
import { CommentItem, CommentList, CommentPost } from "../components";
import { useUserV2 } from "../../User";
import { CommentContext, useCommentContext } from "../controllers/context";
import LoadingDots from "../../../ui/Loading/Dots";
import {
  useCommentGet,
  useCommentList,
  useCommentPost,
  useCommentRemove,
} from "../controllers";
import { useAuthV2 } from "../../../components/Auth/controller";
import { mergeStylesLeft, StylesProps } from "../../../util/style";
import { sprintf } from "sprintf-js";

import "./CommentListView.scss";
import { Button } from "../../../ui";
import { RetweetOutlined } from "@ant-design/icons";
import { Popover, Button as AntdButton, Typography } from "antd";

interface CommentItemContainerProps {
  parentId: number | undefined;
  comment: TypeComment.Get;
  showSubList: boolean;
  showChildCounts: boolean;
}

interface CommentListContainerProps extends StylesProps {
  id: number | undefined;
}

interface CommentListViewProps {}

interface CommentReferenceContainerProps {
  id: number;
}

interface CommentProps {
  scope: string;
  listMaxHeight: {
    main: number;
    sub?: number;
  }
  mainPageSize?: number;
  subPageSize?: number;
}

function CommentReferenceContainer(props: CommentReferenceContainerProps) {
  const { id } = props;
  const { comment, loading, error } = useCommentGet(id);

  if (loading) {
    return null;
  }
  if (error) {
    return <>{error}</>
  }
  return (
    <CommentItem
      comment={comment}
      user={comment.user}
    />
  )
}

function CommentItemContainer(props: CommentItemContainerProps) {
  const { comment, showSubList, showChildCounts } = props;

  const { t } = useCommentContext();
  const { user: currentUser } = useAuthV2();

  const commentPostHook = useCommentPost();
  const commentRemoveHook = useCommentRemove();

  const onClickReply = (comment: TypeComment.Get) => {
    const parentId =
      comment.parentId != undefined ? comment.parentId : comment.id;
    commentPostHook.dispatch({
      type: "set",
      payload: {
        parentId,
        referenceId: comment.id,
        placeholder: sprintf(
          t("REPLY_COMMENT_TO_USER"),
          comment.user.name,
          comment.plainText
        ),
      },
    });
  };

  const onClickRemove = (comment: TypeComment.Get) => {
    commentRemoveHook.run(comment.id);
  };

  return (
    <>
      <CommentItem
        comment={comment}
        user={comment.user}
        headerExtra={comment.referenceId !== undefined && comment.referenceId !== comment.parentId && (
          <Popover
            trigger='hover'
            content={comment.referenceId !== undefined && <CommentReferenceContainer id={comment.referenceId} />}
          >
            <AntdButton type="link" icon={<RetweetOutlined />}></AntdButton>
          </Popover>
        )}
        panel={{
          showChildCounts,
          onClickReply,
          onClickRemove,
          canRemove: !!(
            currentUser?.isLogin &&
            (comment.userId === currentUser.id || currentUser.role & 0b011)
          ),
          removing: commentRemoveHook.loading,
        }}
      />
      {showSubList && comment.childCounts > 0 && (
        <CommentListContainer
          {...mergeStylesLeft("kkjn__comment-list-view__sub-list")}
          id={comment.id}
        />
      )}
    </>
  );
}

function CommentListContainer(props: CommentListContainerProps) {
  const { listMaxHeight, t } = useCommentContext();
  const { id } = props;

  const { comments, loading, error, total, loadMore, hasMore, left } = useCommentList(id);

  const isMainList = id === undefined;

  /** when have comments, means that "loadMore" lead to loading */
  if (loading && comments == null) {
    return <LoadingDots />;
  }
  if (error) {
    return <>{error}</>;
  }

  return (
    <div>
      <CommentList
        {...mergeStylesLeft(null, null, props)}
        maxHeight={isMainList ? listMaxHeight.main : listMaxHeight.sub}
        total={total}
        data={comments}
        renderItem={({ comment, index }) => (
          <CommentItemContainer
            key={index}
            comment={comment}
            parentId={id}
            showSubList={isMainList}
            showChildCounts={isMainList}
          />
        )}
      >
        {!loading && hasMore && (
          <div className="kkjn__comment-list-view__loadmore">
            <Typography.Text>{sprintf(t("COMMENT_LEFT"), left)}, </Typography.Text>
            <Button className="kkjn__loadmore-button" onClick={loadMore} label={t("COMMENT_LOADMORE")} />
          </div>
        )}
        {loading && comments != null && (
          <LoadingDots />
        )}
      </CommentList>
    </div>
  );
}

export function CommentListView(props: CommentListViewProps) {
  const { t } = useCommentContext();
  const commentPostHook = useCommentPost();

  return (
    <>
      <CommentListContainer id={undefined} />
      <CommentPost
        {...mergeStylesLeft("kkjn__comment-post-view", null)}
        placeholder={
          commentPostHook.state.placeholder ?? t("COMMENT_PLACEHOLDER")
        }
        posting={commentPostHook.loading}
        onPost={commentPostHook.post}
        onCancel={
          commentPostHook.state.referenceId === undefined
            ? undefined
            : () => commentPostHook.dispatch({ type: "reset" })
        }
      />
    </>
  );
}

export function Comment(props: CommentProps) {
  return (
    <CommentContext {...props}>
      <CommentListView />
    </CommentContext>
  );
}
