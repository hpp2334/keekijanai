import './Comment.css';
import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Popover, Button, Typography, List, ConfigProvider, Popconfirm, notification, Badge, Space, Skeleton } from 'antd';
import { Translation, useTranslation } from 'react-i18next';
import {
  CommentLoadHookObject, useComment,
  useCommentList, useCommentLoad, getCommentListHookObjectCore, CommentProvider
} from './controller';
import { useAuth } from '../Auth/controller';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import loadable from '@loadable/component';
import { Comment as TypeComment } from 'keekijanai-type';
import { sprintf } from 'sprintf-js';
import { CommentOutlined, DeleteOutlined, RetweetOutlined, SendOutlined, SmileOutlined, WarningOutlined } from '@ant-design/icons';
import { noop, useSwitch, useUnmountCancel, withContexts } from '../../util';
import { useUser } from '../User/controller';
import { format } from 'date-fns-tz';
import clsx from 'clsx';
import { UserComponent } from '../User/UserComponent';
import { authModal } from '../Auth/AuthModal';
import { tap } from 'rxjs/operators';
import _ from 'lodash';
import { Observable } from 'rxjs';
import { TranslationContext } from '../../translations';

const Editor = loadable(() => import('react-draft-wysiwyg' as any).then(v => v.Editor));

export interface CommentProps {
  /** 列表 id，如可取 location.pathname */
  scope: string;
  className?: string;
}

interface CommentHeaderProps {
  comment: TypeComment.Get;
  loading?: CommentLoadHookObject['loading'];
  showReference?: boolean;
}

interface CommentItemProps {
  scope: string;
  comment: TypeComment.Get;
  parent?: TypeComment.Get;
  showChildCounts?: boolean;
  onReply?: (asParent?: boolean) => void;
  onDelete?: () => void;
}

interface CommentListProps {
  scope: string;
  parent?: TypeComment.Get;
  onCreate?: () => void;
  onDelete?: () => void;

  showCommentListHeader?: boolean;
  showCommentReplyCounts?: boolean;

  className?: string;
  style?: React.CSSProperties;
}

type CommentListCoreProps = CommentListProps & ReturnType<typeof getCommentListHookObjectCore>;

interface CommentPostProps {
  scope: string;
  placeholder?: string;
  onPost: (comment: TypeComment.Create) => Observable<any>;
  onCancel?: () => any;
  posting?: boolean;
}

interface ReferenceCommentProps {
  id: number;
}

interface ReadonlyEditorProps {
  comment: TypeComment.Get;
  className?: string;
}

function ReadonlyEditor(props: ReadonlyEditorProps) {
  const { comment, className } = props;
  const editorState = useMemo(() => {
    if (!comment) {
      return EditorState.createEmpty();
    }

    const raw = JSON.parse(comment.content);
    const contentState = convertFromRaw(raw);
    return EditorState.createWithContent(contentState);
  }, [comment]);
  
  return !comment ? null : (
    <Editor
      readOnly={true}
      toolbarHidden={true}
      editorState={editorState}
      onChange={noop}
      editorClassName={clsx("kkjn__content", className)}
    />
  )
}

function CommentHeader(props: CommentHeaderProps) {
  const { comment, loading = 'done', showReference = false } = props;
  const { user, loading: userLoading } = useUser(comment.userId);
  
  return (
    <div className="kkjn__header">
      <UserComponent user={user} loading={userLoading} avatarSize={20} />
      {loading === 'loading' && <Skeleton.Input style={{ width: '150px' }} size='small' />}
      {loading === 'done' && comment && (
        <Typography.Text className="kkjn__date">{format(comment.cTime, 'yyyy-MM-dd HH:mm:ss')}</Typography.Text>
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
  const commentLoadHookObject = useCommentLoad(id);
  const { comment, loading, lastError } = commentLoadHookObject;

  return (
    <div className="kkjn__comment">
      <div className="kkjn__reference-comment">
        {loading === 'loading' && <Skeleton active />}
        {loading === 'done' && comment && (
          <div className="kkjn__comment-item">
            <CommentHeader comment={comment} loading={loading} />
            <ReadonlyEditor comment={comment} />
          </div>
        )}
        {loading === 'error' && (
          <Space direction='horizontal'>
            <WarningOutlined />
            <Typography.Text>{lastError}</Typography.Text>
          </Space>
        )}
      </div>
    </div>
  )
}

function CommentPost(props: CommentPostProps) {
  const { scope, placeholder, onPost, onCancel, posting = false } = props;
  const { t } = useTranslation();
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const unmountCancel = useUnmountCancel();

  const handleSubmit = () => {
    const contentState = editorState.getCurrentContent();
    const raw = convertToRaw(contentState);

    const comment = {
      scope: scope,
      content: JSON.stringify(raw),
      plainText: contentState.getPlainText(),
    };
    
    onPost(comment)
      .pipe(
        unmountCancel(),
      )
      .subscribe({
        next: () => {
          setEditorState(EditorState.createEmpty());
        },
        error: (err) => {
          notification.error({
            message: err?.response?.error ?? err?.message ?? err,
          });
        },
        complete: () => {
          onCancel?.();
        }
      })
  };

  return (
    <div className="kkjn__comment-post">
      <Editor
        // ref={refEditor}
        editorClassName="kkjn__editor"
        toolbarClassName="kkjn__toolbar"
        editorState={editorState}
        onEditorStateChange={setEditorState}
        placeholder={placeholder ?? t("COMMENT_PLACEHOLDER")}
      />
      <div className='kkjn__panel'>
        <Space>
          {onCancel && <Button disabled={posting} onClick={onCancel} size='small'>{t("CANCEL")}</Button>}
          <Button
            disabled={!editorState.getCurrentContent().hasText()}
            loading={posting}
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
  const {
    scope,
    comment: nativeComment,
    parent,
    onReply,
    onDelete,
    showChildCounts = true
  } = props;
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();

  const commentHookObject = useComment(nativeComment, parent);
  const { user, actionState, comment } = commentHookObject;
  const commentListHookObject = useCommentList(comment, true);

  const [replyPlaceHolderMainText] = useState(() => {
    const raw = JSON.parse(comment.content);
    const contentState = convertFromRaw(raw);
    const editorState = EditorState.createWithContent(contentState);
    const plainContent = editorState.getCurrentContent().getPlainText();
    return plainContent;
  });
  const replyPlaceHolder = useMemo(() => {
    return sprintf(t("REPLY_COMMENT_TO_USER"), user?.name, replyPlaceHolderMainText);
  }, [user]);

  const switchShowReply = useSwitch();

  const queryCommentList = useCallback(() => {
    if (!parent && comment.childCounts > 0) {
      commentListHookObject.query();
    }
  }, [comment.childCounts]);

  const handleClickReplyButton = useCallback(() => {
    if (currentUser.isLogin) {
      switchShowReply.switchOpen();
    } else {
      authModal.open();
    }
  }, [currentUser, switchShowReply]);

  const handleRemoveComment = () => {
    commentHookObject
      .remove()
      .subscribe({
        next: () => {
          notification.success({ message: t("DELETE_COMMENT_SUCESS") });
          onDelete?.();
        },
        error: err => notification.error({ message: t("DELETE_COMMENT_ERROR") + ": " + err })
      })
  };
  const handleReply = (created: TypeComment.Create) => {
    const asParent = !parent;
    return commentHookObject
      .reply(created, asParent)
      .pipe(
        tap(() => onReply?.(asParent)),
      )
  };

  const handleListItemCreate = useCallback(() => {
    commentListHookObject.query();
    commentHookObject.reQuery();
  }, [commentListHookObject.query, commentHookObject.reQuery]);

  const handleListItemDelete = useCallback(() => {
    commentListHookObject.query();
    commentHookObject.reQuery();
  }, [commentListHookObject.query, commentHookObject.reQuery]);

  const style = useMemo((): React.CSSProperties => ({
    marginLeft: (parent ? 2 : 1) * 20 + 'px',
  }), []);

  useEffect(() => {
    queryCommentList();
  }, []);
  
  return (
    <div className="kkjn__comment-item">
      <CommentHeader comment={comment} showReference={comment.parentId !== comment.referenceId} />
      <ReadonlyEditor comment={comment} />
      <div className="kkjn__panel">
        {currentUser.isLogin && (currentUser.id === comment.userId || currentUser.role === 0b11) && (
          <Popconfirm
            title={t("READY_TO_REMOVE")}
            placement='top'
            onConfirm={handleRemoveComment}
            okText={t("YES")}
            cancelText={t("NO")}
          >
            <Button loading={actionState === 'removing'} danger={true} type='text' shape='circle' size='small' icon={<DeleteOutlined />}></Button>
          </Popconfirm>
        )}
        <Button
          disabled={actionState === 'removing'}
          type='text'
          className={clsx(
            'kkjn__button',
            switchShowReply.open ? 'kkjn__button-activated' : ''
          )}
          size='small'
          icon={<CommentOutlined />}
          onClick={handleClickReplyButton}  
        >{!!showChildCounts && ' ' + comment.childCounts}</Button>
      </div>
      {switchShowReply.open && currentUser.isLogin && (
        <CommentPost
          scope={scope}
          posting={actionState === 'replying'}
          onPost={handleReply}
          onCancel={switchShowReply.off}
          placeholder={replyPlaceHolder}
        />
      )}
      {!parent && comment.childCounts > 0 && (
        <CommentListCore
          {...getCommentListHookObjectCore(commentListHookObject)}
          onCreate={handleListItemCreate}
          onDelete={handleListItemDelete}
          scope={scope}
          parent={comment}
          style={style}
          className={'kkjn__sub-list'}
          showCommentListHeader={false}
          showCommentReplyCounts={false}
        />
      )}
    </div>
  )
}

function EmptyCommentList() {
  return (
    <div className="kkjn__empty-list">
      <SmileOutlined className="kkjn__icon" />
      <Typography.Title className="kkjn__text" level={5}>
        <Translation>
          {(t) => t("NO_COMMENT")}
        </Translation>
      </Typography.Title>
    </div>
  )
}

function CommentListCore(props: CommentListCoreProps) {
  const {
    scope,
    parent,
    className,
    style,
    onCreate,
    onDelete,
    showCommentReplyCounts = true,
    showCommentListHeader = true
  } = props;
  const { page, pageSize, total, loading, lastError, comments, changePage } = props;
  const { t } = useTranslation();

  const handleItemReply = useCallback((asParent?: boolean) => {
    if (!asParent) {
      onCreate?.();
    }
  }, [onCreate]);

  const handleItemDelete = useCallback(() => {
    onDelete?.();
  }, [onDelete]);

  const pagination = useMemo(() => ({
    simple: true,
    size: 'small' as const,
    pageSize: pageSize,
    total: total ?? 0,
    current: page,
    onChange: changePage
  }), [page, total, pageSize, changePage]);

  return (parent && total === 0) ? null : (
    <div className={clsx('kkjn__list', className)} style={style}>
      {showCommentListHeader && (
        <div className="kkjn__header">
          <span className="kkjn__title">{t("COMMENT_LIST")}</span>
          {total !== undefined && <Badge count={total}></Badge>}
        </div>
      )}
      {loading === 'init-loading' && (
        <Skeleton active />
      )}
      {loading === 'error' && (
        <Typography.Text>{lastError}</Typography.Text>
      )}
      {(loading === 'done' || loading === 'loading') && (
        <ConfigProvider renderEmpty={EmptyCommentList}>
          <List
            size='small'
            split={false}
            loading={loading === 'loading'}
            itemLayout='vertical'
            pagination={pageSize > (total ?? 0) ? undefined : pagination}
            dataSource={comments ?? []}
            renderItem={item => (
              <List.Item
                key={item.id + '$' + item.childCounts}
              >
                <CommentItem
                  scope={scope}
                  parent={parent}
                  comment={item}
                  onReply={handleItemReply}
                  onDelete={handleItemDelete}
                  showChildCounts={showCommentReplyCounts}
                />
              </List.Item>
            )}
          />
        </ConfigProvider>
      )}
    </div>
  )
}

export const CommentCore = withContexts<CommentProps>(
  TranslationContext,
  CommentProvider,
)(function (props) {
  const { scope, className } = props;
  const { user } = useAuth();
  const unmountCancel = useUnmountCancel();

  const [posting, setPosting] = useState(false);
  const commentListHookObject = useCommentList();

  const handlePost = useCallback((comment: TypeComment.Create) => {
    setPosting(true);
    return commentListHookObject
      .create(scope, comment)
      .pipe(
        unmountCancel(),
        tap({
          next: () => setPosting(false),
          error: () => setPosting(false),
        }),
        tap(() => commentListHookObject.changePage(1))
      )
  }, [commentListHookObject.create, commentListHookObject.query]);

  return (
    <div className={clsx('kkjn__comment', className)}>
      <CommentListCore
        scope={scope}
        {...getCommentListHookObjectCore(commentListHookObject)}
        onCreate={commentListHookObject.query}
        onDelete={commentListHookObject.query}
      />
      {user.isLogin && <CommentPost scope={scope} onPost={handlePost} posting={posting} />}
    </div>
  )
});


export const Comment = CommentCore;
