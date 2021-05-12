import React, { useState, useContext, useCallback, useEffect, useRef } from 'react'
import { Popover, Button, Pagination, Typography, Empty, List, ConfigProvider, Popconfirm, notification } from 'antd';
import moment from 'moment';
import { Translation, useTranslation } from 'react-i18next';
import { CommentListHookObject, useCommentList } from './controller';
import { useAuth } from '../Auth/controller';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import Editor from '@draft-js-plugins/editor';
import createEmojiPlugin from '@draft-js-plugins/emoji';
import { Comment as TypeComment } from 'keekijanai-type';

import './Comment.css';
import { CommentOutlined, SmileOutlined } from '@ant-design/icons';
import { useMemoExports } from '../../util';
import { useUser } from '../User/controller';
import { Avatar } from '../User';

export interface CommentProps {
  scope: string;
  className?: string;
}

interface CommentItemProps {
  scope: string;
  comment: TypeComment.Get;
  commentListHookObj: CommentListHookObject;
}

interface CommentListProps {
  scope: string;
  commentListHookObj: CommentListHookObject;
}

interface SubCommentListProps {
  scope: string;
  parentId: number;
}

interface CommentPostProps {
  scope: string;
  parentId?: number;
  referenceId?: number;
  commentListHookObj: CommentListHookObject;
}

const emojiPlugin = createEmojiPlugin();
const { EmojiSuggestions, EmojiSelect } = emojiPlugin;
const commentPostPlugins = [emojiPlugin];

function CommentItem(props: CommentItemProps) {
  const { comment, commentListHookObj } = props;
  const { t } = useTranslation();
  const { user } = useUser(comment.userId);
  const [editorState] = useState(() => {
    const raw = JSON.parse(comment.content);
    const contentState = convertFromRaw(raw);
    return EditorState.createWithContent(contentState);
  });

  const handleRemoveComment = (id: number) => (ev: any) => {
    commentListHookObj.remove(id);
  };

  if (!user) {
    return null;
  }
  
  return (
    <div>
      <Avatar user={user} />
      <Typography.Text>{user.name}</Typography.Text>
      <Editor
        readOnly={true}
        editorState={editorState}
        plugins={commentPostPlugins}
      />
      <div>
        <Button ghost={true} type='text' icon={<CommentOutlined />}>{comment.childCounts}</Button>
        <Popconfirm
          title={t("CONFIRM")}
          placement='top'
          onConfirm={handleRemoveComment(comment.id)}
          okText={t("YES")}
          cancelText={t("NO")}
        >
          <Button>{t("REMOVE")}</Button>
        </Popconfirm>
      </div>
    </div>
  )
}

function SubCommentList(props: SubCommentListProps) {
  const { scope, parentId } = props;
  const commentHookObj = useCommentList(scope, parentId);

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
  const { scope, commentListHookObj } = props;
  const { t } = useTranslation();
  const { user } = useAuth();

  const handleChangePage = useCallback((page: number) => {
    commentListHookObj.changePage(page);
  }, []);
  const pagination = useMemoExports({ pageSize: commentListHookObj.pageSize, handleChangePage })

  return (
    <div>
      <div>Total comments: {commentListHookObj.list?.total}</div>
      <ConfigProvider renderEmpty={EmptyCommentList}>
        <List
          itemLayout='vertical'
          pagination={pagination}
          dataSource={commentListHookObj.list?.comments ?? []}
          renderItem={item => (
            <List.Item
              key={item.id}
            >
              <CommentItem scope={scope} comment={item} commentListHookObj={commentListHookObj} />
            </List.Item>
          )}
        />
      </ConfigProvider>
    </div>
  )
}

function CommentPost(props: CommentPostProps) {
  const { scope, parentId, referenceId, commentListHookObj } = props;
  const { t } = useTranslation();
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [creating, setCreating] = useState(false);
  const refEditor = useRef<Editor>(null);

  const handleContainerClick = () => {
    refEditor.current?.focus();
  }
  
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
      },
      error: (err) => {
        notification.error({
          message: err.message,
        });
        setCreating(false);
      },
    })
  };

  return (
    <div>
      <div className='__Keekijanai__Comment-post-editor-container' onClick={handleContainerClick}>
        <Editor
          ref={refEditor}
          editorState={editorState}
          onChange={setEditorState}
          placeholder={t("COMMENT_PLACEHOLDER")}
          plugins={commentPostPlugins}
        />
      </div>
      <div className='__Keekijanai__Comment_post-panel'>
        <EmojiSelect />
        <Button disabled={!editorState.getCurrentContent().hasText()} loading={creating} type='primary' onClick={handleSubmit}>{t("POST_COMMENT")}</Button>
      </div>
    </div>
  )
}

export function Comment(props: CommentProps) {
  const { scope, className } = props;
  const commentHookObj = useCommentList(scope, undefined);
  const { user } = useAuth();

  return (
    <div className={className}>
      <div className="rounded-md text-center bg-gray-50 py-5">
      {
        commentHookObj.loadingState === 'loading'
          ? "loading comments"
          : commentHookObj.loadingState === 'error'
            ? "error when loading comments: " + commentHookObj.lastError
            : <CommentList scope={scope} commentListHookObj={commentHookObj} />
      }
      </div>
      {user.isLogin && <CommentPost scope={scope} commentListHookObj={commentHookObj} />}
    </div>
  )
}
