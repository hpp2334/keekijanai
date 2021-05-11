import React, { useState, useContext, useCallback, useEffect, useRef } from 'react'
import { Popover, Button, Pagination } from 'antd';
import { Suspense } from 'react';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CommentHookObject, useComment } from './controller';
import { useAuth } from '../Auth/controller';

export interface CommentProps {
  scope: string;
  className?: string;
}

interface CommentListProps {
  scope: string;
  commentHookObj: CommentHookObject;
}

interface SubCommentListProps {
  scope: string;
  parentId: number;
}

interface CommentPostProps {
  scope: string;
  parentId?: number;
  referenceId?: number;
  commentHookObj: CommentHookObject;
}


function SubCommentList(props: SubCommentListProps) {
  const { scope, parentId } = props;
  const commentHookObj = useComment(scope, parentId);

  if (!commentHookObj.list?.total) {
    return null;
  }

  return (
    <ul>
    {
      commentHookObj.list.comments.map(comment => (
        <li key={comment.id}>
          <div>
            {comment.userId}
            {comment.content}
          </div>
        </li>
      ))
    }
    </ul>
  )
}

function CommentList(props: CommentListProps) {
  const { scope, commentHookObj } = props;
  const { t } = useTranslation();
  const { user } = useAuth();

  const [visRemovePopover, setVisRemovePopover] = useState(false);
  const handleShowRemovePopover = useCallback(() => setVisRemovePopover(true), []);
  const handleHideRemovePopover = useCallback(() => setVisRemovePopover(false), []);

  const isRemoving = commentHookObj.loadingState === 'removing';

  const handleRemoveComment = (id: number) => (ev: any) => {
    commentHookObj.remove(id);
  };

  const handleChangePage = (page: number, pageSize?: number) => {
    commentHookObj.changePage(page);
  };

  return (
    <div>
      {
        !commentHookObj.list?.total && (
          <div>
          {t("NO_COMMENT")}
          </div>
        )
      }
      {
        commentHookObj.list?.total && (
          <>
            <div>Total comments: {commentHookObj.list.total}</div>
            <ul className="text-left px-4">
            {
              commentHookObj.list.comments.map(comment => (
                <li key={comment.id} className="group">
                  <div>
                    <span className="inline-block mr-4 text-secondary">{comment.userId}</span>
                    <span className="text-subtext text-sm inline-block">{moment(comment.cTime).format('YYYY-MM-DD hh:mm:ss')}</span>
                  </div>
                  <div>{comment.content}</div>
                  {user.isLogin && comment.userId === user.id && (
                    <div className="flex justify-end opacity-0 group-hover:opacity-100">
                      <Button>{t("REPLY")}</Button>
                      <Popover
                        title='Remove comment'
                        trigger='click'
                        visible={visRemovePopover}
                        onVisibleChange={setVisRemovePopover}
                        content={
                          <div className="w-60 p-3 shadow-md bg-white text-left">
                            {t("READY_TO_REMOVE")}
                            <div className="flex justify-end my-2">
                              <Button disabled={isRemoving} onClick={handleRemoveComment(comment.id)}>{t("CONFIRM")}</Button>
                              <Button disabled={isRemoving} onClick={handleHideRemovePopover}>{t("CANCEL")}</Button>
                            </div>
                          </div>
                        }
                      >
                        <Button onClick={handleShowRemovePopover}>{t("REMOVE")}</Button>
                      </Popover>
                    </div>
                  )}
                  {/* {comment.childCounts > 0 && <SubCommentList slug={slug} parentId={comment.id} />} */}
                </li>
              ))
            }
            </ul>
            <Pagination size="small" total={commentHookObj.list.total} onChange={handleChangePage} />
          </>
        )
      }
    </div>
  )
}

function CommentPost(props: CommentPostProps) {
  const { scope, parentId, referenceId, commentHookObj } = props;
  const { t } = useTranslation();
  
  const { register, handleSubmit: wrapHandleSubmit } = useForm();
  const handleSubmit = async (data: any) => {
    const comment = {
      scope: scope,
      content: data.content,
      parentId,
      referenceId,
    };
    
    commentHookObj.create(scope, comment);
  };

  return (
    <div className="my-5">
      <form onSubmit={wrapHandleSubmit(handleSubmit)}>
        <textarea
          rows={6}
          className="block text-md border rounded px-2 py-1 outline-none w-80 focus:border-primary"
          placeholder={t("POST_COMMENT_CONTENT")}
          {...register('content', { required: true, })}
        />
      </form>
    </div>
  )
}

export function Comment(props: CommentProps) {
  const { scope, className } = props;
  const commentHookObj = useComment(scope, undefined);
  const { user } = useAuth();

  return (
    <div className={className}>
      <div className="rounded-md text-center bg-gray-50 py-5">
      {
        commentHookObj.loadingState === 'loading'
          ? "loading comments"
          : commentHookObj.loadingState === 'error'
            ? "error when loading comments: " + commentHookObj.lastError
            : <CommentList scope={scope} commentHookObj={commentHookObj} />
      }
      </div>
      {user.isLogin && <CommentPost scope={scope} commentHookObj={commentHookObj} />}
    </div>
  )
}
