import React, { useState, useContext, useCallback, useEffect, useRef, useMemo } from 'react'
import { Popover, Button, Pagination, Typography, Empty, List, ConfigProvider, Popconfirm, notification, Badge, Space, Skeleton } from 'antd';
import moment from 'moment';
import { Translation, useTranslation } from 'react-i18next';
import { CommentHookObject, CommentListHookObject, useComment, useCommentList } from './controller';
import { useAuth } from '../Auth/controller';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import loadable from '@loadable/component';
import { Comment as TypeComment } from 'keekijanai-type';
import { sprintf } from 'sprintf-js';
import { CommentOutlined, DeleteOutlined, RetweetOutlined, SendOutlined, SmileOutlined, WarningOutlined } from '@ant-design/icons';
import { noop, useMemoExports, useSwitch } from '../../util';
import { useUser } from '../User/controller';
import { Avatar } from '../User';
import { format } from 'date-fns';

import './Comment.css';
import clsx from 'clsx';
import { UserComponent } from '../User/UserComponent';
import { comment } from 'keekijanai-client-core';
import { authModal } from '../Auth/AuthModal';

const Editor = loadable(() => import('react-draft-wysiwyg' as any).then(v => v.Editor));

export interface CommentProps {
  scope: string;
  className?: string;
}

interface CommentHeaderProps {
  commentHookObject: Pick<CommentHookObject, 'comment' | 'loading'>;
  showReference?: boolean;
}

interface CommentItemProps {
  scope: string;
  comment: TypeComment.Get;
  commentListHookObj: CommentListHookObject;
  level: number;
  showCommentCounts?: boolean;
}

interface CommentListProps {
  scope: string;
  commentListHookObj: CommentListHookObject;
  level: number;

  showCommentListHeader?: boolean;
  showCommentsCounts?: boolean;

  className?: string;
  style?: React.CSSProperties;
}

interface SubCommentListProps {
  scope: string;
  parentId: number;
  level: number;
}

interface CommentPostProps {
  scope: string;
  parentId?: number;
  referenceId?: number;
  commentListHookObj: CommentListHookObject;
  placeholder?: string;
  onCancel?: () => any;
}

interface ReferenceCommentProps {
  id: number;
}

interface ReadonlyEditorProps {
  commentHookObject: CommentHookObject;
  className?: string;
}

function ReadonlyEditor(props: ReadonlyEditorProps) {
  const { commentHookObject: referenceComment, className } = props;
  const editorState = useMemo(() => {
    if (!referenceComment.comment) {
      return EditorState.createEmpty();
    }

    const raw = JSON.parse(referenceComment.comment.content);
    const contentState = convertFromRaw(raw);
    return EditorState.createWithContent(contentState);
  }, [referenceComment]);
  
  return !referenceComment.comment ? null : (
    <Editor
      readOnly={true}
      toolbarHidden={true}
      editorState={editorState}
      onChange={noop}
      editorClassName={clsx("__Keekijanai__Comment_item-content", className)}
    />
  )
}

function CommentHeader(props: CommentHeaderProps) {
  const { commentHookObject, showReference = false } = props;
  const { comment, loading } = commentHookObject;
  const userHookObject = useUser();

  useEffect(() => {
    if (comment) {
      userHookObject.update(comment.userId);
    }
  }, [comment]);
  
  return (
    <div className="__Keekijanai__Comment_CommentHeader-container">
      <UserComponent userHookObject={userHookObject} avatarSize={20} />
      {loading === 'loading' && <Skeleton.Input style={{ width: '150px' }} size='small' />}
      {loading === 'done' && comment && (
        <Typography.Text className="__Keekijanai__Comment_item-date">{format(comment.cTime, 'yyyy-MM-dd hh:mm:ss')}</Typography.Text>
      )}
      {showReference && !!comment?.referenceId && (
        <Popover
          trigger='hover'
          content={<ReferenceComment id={comment.referenceId} />}
        >
          <Button type='link' icon={<RetweetOutlined />}></Button>
        </Popover>
      )}
    </div>
  )
}

function ReferenceComment(props: ReferenceCommentProps) {
  const { id } = props;
  const commentHookObject = useComment(id);
  const { comment, loading, lastError } = commentHookObject;
  const userHookObject = useUser();

  useEffect(() => {
    if (loading === 'done' && comment) {
      userHookObject.update(comment.userId);
    }
  }, [comment, loading]);

  return (
    <div className="__Keekijanai__Comment_ReferenceComment-container">
      {loading === 'loading' && <Skeleton active />}
      {loading === 'done' && comment && (
        <div>
          <CommentHeader commentHookObject={commentHookObject} />
          <ReadonlyEditor commentHookObject={commentHookObject} className="__Keekijanai__Comment-reference-editor-container" />
        </div>
      )}
      {loading === 'error' && (
        <Space direction='horizontal'>
          <WarningOutlined />
          <Typography.Text>{lastError}</Typography.Text>
        </Space>
      )}
    </div>
  )
}

function CommentPost(props: CommentPostProps) {
  const { scope, parentId, referenceId, commentListHookObj, placeholder, onCancel } = props;
  const { t } = useTranslation();
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [creating, setCreating] = useState(false);
  
  const handleSubmit = () => {
    const contentState = editorState.getCurrentContent();
    const raw = convertToRaw(contentState);

    const comment = {
      scope: scope,
      content: JSON.stringify(raw),
      plainText: contentState.getPlainText(),
      parentId,
      referenceId,
    };
    
    setCreating(true);
    commentListHookObj.create(scope, comment).subscribe({
      next: () => {
        setEditorState(EditorState.createEmpty());
        setCreating(false);
        onCancel?.();
      },
      error: (err) => {
        notification.error({
          message: err?.message ?? err,
        });
        setCreating(false);
      },
    })
  };

  return (
    <div className="__Keekijanai__Comment-post-editor-container">
      <Editor
        // ref={refEditor}
        editorClassName="__Keekijanai__Comment-post-editor"
        toolbarClassName="__Keekijanai__Comment-post-editor-toolbar"
        editorState={editorState}
        onEditorStateChange={setEditorState}
        placeholder={placeholder ?? t("COMMENT_PLACEHOLDER")}
      />
      <div className='__Keekijanai__Comment_post-panel'>
        <Space>
          {onCancel && <Button disabled={creating} onClick={onCancel} size='small'>{t("CANCEL")}</Button>}
          <Button
            disabled={!editorState.getCurrentContent().hasText()}
            loading={creating}
            type='primary'
            onClick={handleSubmit}
            icon={<SendOutlined />}
            size='small'
          >
            {t("POST_COMMENT")}
          </Button>
        </Space>
      </div>
    </div>
  )
}

function CommentItem(props: CommentItemProps) {
  const { scope, comment, commentListHookObj, level, showCommentCounts = true } = props;
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();

  const userHookObject = useUser(comment.userId);
  const { user } = userHookObject;

  const [editorState] = useState(() => {
    const raw = JSON.parse(comment.content);
    const contentState = convertFromRaw(raw);
    return EditorState.createWithContent(contentState);
  });
  const [removing, setRemoving] = useState(false);
  
  const replyPlaceHolder = useMemo(() => {
    const plainContent = editorState.getCurrentContent().getPlainText();
    return sprintf(t("REPLY_COMMENT_TO_USER"), user?.name, plainContent);
  }, [user, editorState]);

  const switchShowReply = useSwitch();

  const composedCommentHO = useMemo(() => {
    return {
      comment,
      loading: 'done' as const,
    }
  }, []);

  const handleReply = useCallback(() => {
    if (currentUser.isLogin) {
      switchShowReply.switchOpen();
    } else {
      authModal.open();
    }
  }, [currentUser, switchShowReply]);

  const handleRemoveComment = (id: number) => (ev: any) => {
    setRemoving(true);
    commentListHookObj
      .remove(id)
      .subscribe({
        next: val => {
          notification.success({ message: t("DELETE_COMMENT_SUCESS") })
        },
        error: err => {
          notification.error({ message: t("DELETE_COMMENT_ERROR") + ": " + err })
        },
        complete: () => {
          setRemoving(false);
        }
      })
  };
  
  return (
    <div>
      <CommentHeader commentHookObject={composedCommentHO} showReference={true} />
      <Editor
        readOnly={true}
        toolbarHidden={true}
        editorState={editorState}
        onChange={noop}
        editorClassName="__Keekijanai__Comment_item-content"
      />
      <div className="__Keekijanai__Comment_item-panel">
        {currentUser.isLogin && currentUser.id === comment.userId && (
          <Popconfirm
            title={t("READY_TO_REMOVE")}
            placement='top'
            onConfirm={handleRemoveComment(comment.id)}
            okText={t("YES")}
            cancelText={t("NO")}
          >
            <Button loading={removing} danger={true} type='text' shape='circle' size='small' icon={<DeleteOutlined />}></Button>
          </Popconfirm>
        )}
        <Button
          disabled={removing}
          type='text'
          className={clsx(
            '__Keekijanai__Comment_item-comment-button',
            switchShowReply.open ? '__Keekijanai__Comment_item-comment-button-activated' : ''
          )}
          size='small'
          icon={<CommentOutlined />}
          onClick={handleReply}  
        >{!!showCommentCounts && ' ' + comment.childCounts}</Button>
      </div>
      {switchShowReply.open && currentUser.isLogin && <CommentPost
        scope={scope}
        commentListHookObj={commentListHookObj}
        parentId={level <= 1 ? comment.id : comment.parentId}
        referenceId={level <= 1 ? undefined : comment.id}
        onCancel={switchShowReply.off}
        placeholder={replyPlaceHolder}
      />}
      {level <= 1 && comment.childCounts > 0 && <SubCommentList scope={scope} parentId={comment.id} level={level + 1} />}
    </div>
  )
}

function SubCommentList(props: SubCommentListProps) {
  const { scope, parentId, level } = props;
  const commentListHookObj = useCommentList(scope, parentId);

  const style = useMemo((): React.CSSProperties => ({
    marginLeft: level * 20 + 'px',
  }), []);

  return (
    <CommentList
      className="__Keekijanai__Comment_sub-list-container"
      scope={scope}
      commentListHookObj={commentListHookObj}
      style={style}
      showCommentListHeader={false}
      showCommentsCounts={false}
      level={level}
    />
  )
}

function EmptyCommentList() {
  return (
    <div className="__Keekijanai__Comment_empty-list-container">
      <SmileOutlined className="__Keekijanai__Comment_empty-list-icon" />
      <Typography.Title className="__Keekijanai__Comment_empty-list-text" level={5}>
        <Translation>
          {(t) => t("NO_COMMENT")}
        </Translation>
      </Typography.Title>
    </div>
  )
}

function CommentList(props: CommentListProps) {
  const { scope, commentListHookObj, level, showCommentsCounts = true, showCommentListHeader = true, className, style } = props;
  const { t } = useTranslation();

  const handleChangePage = useCallback((page: number) => {
    commentListHookObj.changePage(page);
  }, [commentListHookObj]);
  const pagination = useMemo(() => ({
    simple: true,
    size: 'small' as const,
    pageSize: commentListHookObj.pageSize,
    total: commentListHookObj.total ?? 0,
    current: commentListHookObj.page,
    onChange: handleChangePage
  }), [handleChangePage, commentListHookObj.page, commentListHookObj.total, commentListHookObj.pageSize]);

  return (
    <div className={className} style={style}>
      {showCommentListHeader && (
        <div className="__Keekijanai__Comment_empty-list-header">
          <span className="__Keekijanai__Comment_empty-list-header-title">{t("COMMENT_LIST")}</span>
          {commentListHookObj.total !== undefined && <Badge count={commentListHookObj.total}></Badge>}
        </div>
      )}
      {commentListHookObj.loading === 'init-loading' && (
        <Skeleton active />
      )}
      {(commentListHookObj.loading === 'done' || commentListHookObj.loading === 'loading') && (
        <ConfigProvider renderEmpty={EmptyCommentList}>
          <List
            size='small'
            split={false}
            loading={commentListHookObj.loading === 'loading'}
            itemLayout='vertical'
            pagination={pagination}
            dataSource={commentListHookObj.comments ?? []}
            renderItem={item => (
              <List.Item
                key={item.id + '$' + item.childCounts}
              >
                <CommentItem scope={scope} comment={item} commentListHookObj={commentListHookObj} level={level} showCommentCounts={showCommentsCounts} />
              </List.Item>
            )}
          />
        </ConfigProvider>
      )}
    </div>
  )
}

export function Comment(props: CommentProps) {
  const { scope, className } = props;
  const commentListHookObj = useCommentList(scope, undefined);
  const { user } = useAuth();

  return (
    <div className={className}>
      <CommentList scope={scope} commentListHookObj={commentListHookObj} level={1} />
      {user.isLogin && <CommentPost scope={scope} commentListHookObj={commentListHookObj} />}
    </div>
  )
}
