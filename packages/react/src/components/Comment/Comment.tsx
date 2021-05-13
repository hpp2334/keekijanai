import React, { useState, useContext, useCallback, useEffect, useRef, useMemo } from 'react'
import { Popover, Button, Pagination, Typography, Empty, List, ConfigProvider, Popconfirm, notification, Badge, Space } from 'antd';
import moment from 'moment';
import { Translation, useTranslation } from 'react-i18next';
import { CommentListHookObject, useComment, useCommentList } from './controller';
import { useAuth } from '../Auth/controller';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { Comment as TypeComment } from 'keekijanai-type';
import { sprintf } from 'sprintf-js';
import { CommentOutlined, DeleteOutlined, SmileOutlined } from '@ant-design/icons';
import { noop, useMemoExports, useSwitch } from '../../util';
import { useUser } from '../User/controller';
import { Avatar } from '../User';
import { format } from 'date-fns';

import './Comment.css';
import clsx from 'clsx';

export interface CommentProps {
  scope: string;
  className?: string;
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
  parentCommentlevel: number;
}

interface ReadonlyEditorProps {
  id: number;
  className?: string;
}

function ReadonlyEditor(props: ReadonlyEditorProps) {
  const { id, className } = props;
  const referenceComment = useComment(id);
  const editorState = useMemo(() => {
    if (!referenceComment.comment) {
      return EditorState.createEmpty();
    }

    const raw = JSON.parse(referenceComment.comment.content);
    const contentState = convertFromRaw(raw);
    return EditorState.createWithContent(contentState);
  }, [referenceComment]);
  
  return !!referenceComment.comment && (
    <Editor
      readOnly={true}
      toolbarHidden={true}
      editorState={editorState}
      onChange={noop}
      editorClassName={clsx("__Keekijanai__Comment_item-content", className)}
    />
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
          {onCancel && <Button onClick={onCancel}>{t("CANCEL")}</Button>}
          <Button disabled={!editorState.getCurrentContent().hasText()} loading={creating} type='primary' onClick={handleSubmit}>{t("POST_COMMENT")}</Button>
        </Space>
      </div>
    </div>
  )
}

function CommentItem(props: CommentItemProps) {
  const { scope, comment, commentListHookObj, level, showCommentCounts = true } = props;
  const { t } = useTranslation();
  const { user } = useUser(comment.userId);
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

  if (!user) {
    return null;
  }
  
  return (
    <div>
      <div className="__Keekijanai__Comment_item-header">
        <Avatar size='20px' user={user} />
        <Typography.Text className="__Keekijanai__Comment_item-text">{user.name}</Typography.Text>
        <Typography.Text className="__Keekijanai__Comment_item-date">{format(comment.cTime, 'yyyy-MM-dd hh:mm:ss')}</Typography.Text>
      </div>
      {comment.referenceId && (
        <ReadonlyEditor id={comment.referenceId} className="__Keekijanai__Comment-reference-editor-container" />
      )}
      <Editor
        readOnly={true}
        toolbarHidden={true}
        editorState={editorState}
        onChange={noop}
        editorClassName="__Keekijanai__Comment_item-content"
      />
      <div className="__Keekijanai__Comment_item-panel">
        <Popconfirm
          title={t("READY_TO_REMOVE")}
          placement='top'
          onConfirm={handleRemoveComment(comment.id)}
          okText={t("YES")}
          cancelText={t("NO")}
        >
          <Button loading={removing} danger={true} type='text' shape='circle' size='small' icon={<DeleteOutlined />}></Button>
        </Popconfirm>
        <Button
          disabled={removing}
          type={switchShowReply.open ? 'primary' : 'text'}
          size='small'
          icon={<CommentOutlined />}
          onClick={switchShowReply.switchOpen}  
        >{!!showCommentCounts && ' ' + comment.childCounts}</Button>
      </div>
      {switchShowReply.open && <CommentPost
        scope={scope}
        commentListHookObj={commentListHookObj}
        parentId={level <= 1 ? comment.id : comment.parentId}
        referenceId={level <= 1 ? undefined : comment.id}
        onCancel={switchShowReply.off}
        placeholder={replyPlaceHolder}
        parentCommentlevel={level}
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

  if (!commentListHookObj.list?.total) {
    return null;
  }

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
  const { user } = useAuth();

  const handleChangePage = useCallback((page: number) => {
    commentListHookObj.changePage(page);
  }, [commentListHookObj]);
  const pagination = useMemo(() => ({
    simple: true,
    pageSize: commentListHookObj.pageSize,
    total: commentListHookObj.list?.total ?? 0,
    current: commentListHookObj.page,
    onChange: handleChangePage
  }), [handleChangePage, commentListHookObj.page, commentListHookObj.list?.total, commentListHookObj.pageSize]);

  return (
    <div className={className} style={style}>
      {showCommentListHeader && (
        <div className="__Keekijanai__Comment_empty-list-header">
          <span className="__Keekijanai__Comment_empty-list-header-title">{t("COMMENT_LIST")}</span>
          <Badge count={commentListHookObj.list?.total ?? 0}></Badge>
        </div>
      )}
      <ConfigProvider renderEmpty={EmptyCommentList}>
        <List
          split={false}
          itemLayout='vertical'
          pagination={pagination}
          dataSource={commentListHookObj.list?.comments ?? []}
          renderItem={item => (
            <List.Item
              key={item.id}
            >
              <CommentItem scope={scope} comment={item} commentListHookObj={commentListHookObj} level={level} showCommentCounts={showCommentsCounts} />
            </List.Item>
          )}
        />
      </ConfigProvider>
    </div>
  )
}

export function Comment(props: CommentProps) {
  const { scope, className } = props;
  const commentHookObj = useCommentList(scope, undefined);
  const { user } = useAuth();

  return (
    <div className={className}>
      <div>
      {
        commentHookObj.loadingState === 'init-loading'
          ? "loading comments"
          : commentHookObj.loadingState === 'error'
            ? "error when loading comments: " + commentHookObj.lastError
            : <CommentList scope={scope} commentListHookObj={commentHookObj} level={1} />
      }
      </div>
      {user.isLogin && <CommentPost scope={scope} commentListHookObj={commentHookObj} parentCommentlevel={0} />}
    </div>
  )
}
