import './Comment.css';
import React, { useState, useCallback, useMemo } from 'react'
import { Popover, Button, Typography, List, ConfigProvider, Popconfirm, notification, Badge, Space, Skeleton } from 'antd';
import { Translation, useTranslation } from 'react-i18next';
import {
  useComment,
  useCommentList, CommentProvider
} from './controller';
import { useAuth } from '../Auth/controller';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { Comment as TypeComment, User } from 'keekijanai-type';
import { sprintf } from 'sprintf-js';
import { CommentOutlined, DeleteOutlined, RetweetOutlined, SmileOutlined, WarningOutlined } from '@ant-design/icons';
import { useUnmountCancel, useHover } from '../../util';
import { useUser } from '../User/controller';
import { format } from 'date-fns-tz';
import clsx from 'clsx';
import { UserComponent } from '../User/UserComponent';
import { authModal } from '../Auth/AuthModal';
import { tap } from 'rxjs/operators';
import _ from 'lodash';
import { Observable, of, throwError } from 'rxjs';
import { FetchResponse, getRspError, useFetchResponse } from '../../util/request';
import { CommentEditor, CommentEditorContent } from './CommentEditor';
import { Avatar } from '../User';
import { useObservableCallback, useSubscription } from 'observable-hooks';


export interface CommentProps {
  /** 列表 id，如可取 location.pathname */
  scope: string;
  className?: string;
}

interface CommentHeaderProps {
  commentRsp: FetchResponse<TypeComment.Get>;
  showReference?: boolean;
}

interface CommentItemProps {
  comment: TypeComment.Get;
  showChildCounts?: boolean;
  onClickReply?: (comment: TypeComment.Get, user: User.User) => void;
}

interface CommentListCoreProps {
  id: number | undefined;

  showCommentListHeader?: boolean;
  showCommentReplyCounts?: boolean;

  onItemClickReply?: (comment: TypeComment.Get, user: User.User) => void;

  postChild?: (
    create: (comment: Pick<TypeComment.Create, 'content' | 'plainText'>, referenceId: number | undefined) => Observable<any>
  ) => React.ReactNode;

  className?: string;
  style?: React.CSSProperties;
}

interface RootCommentListProps {
  className?: string;
  style?: React.CSSProperties;
}

interface ChildCommentListProps {
  comment: TypeComment.Get;
  user: User.User;
  className?: string;
  style?: React.CSSProperties;
  replyClick$: Observable<any>;
}

interface CommentPostProps {
  placeholder?: string;
  collapsed?: boolean;
  onClick?: () => void;
  onPost: (comment: Pick<TypeComment.Create, 'content' | 'plainText'>) => Observable<any>;
  onCancel?: () => any;
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
  
  return (
    <div className={className}>
      <CommentEditorContent
        readonly={true}
        editorState={editorState}
        onEditorStateChange={_.noop}
      />
    </div>
  )
}

function CommentHeader(props: CommentHeaderProps) {
  const { commentRsp, showReference = false } = props;
  const { userRsp } = useUser(commentRsp.data?.userId);
  
  return (
    <div className="kkjn__header">
      <UserComponent userRsp={userRsp} avatarSize={20} />
      {(commentRsp.stage === 'pending' || commentRsp.stage === 'requesting') && <Skeleton.Input style={{ width: '150px' }} size='small' />}
      {(commentRsp.stage === 'done') && (
        <>
          <Typography.Text className="kkjn__date">{format(commentRsp.data.cTime, 'yyyy-MM-dd HH:mm:ss')}</Typography.Text>
          {showReference && commentRsp.data.referenceId !== undefined && (
            <Popover
              trigger='hover'
              content={<ReferenceComment id={commentRsp.data.referenceId} />}
            >
              <Button type='link' icon={<RetweetOutlined />}></Button>
            </Popover>
          )}
        </>
      )}
    </div>
  )
}

function ReferenceComment(props: ReferenceCommentProps) {
  const { id } = props;
  const { commentRsp } = useComment(id);

  return (
    <div className="kkjn__comment">
      <div className="kkjn__reference-comment">
        {(commentRsp.stage === 'pending' || commentRsp.stage === 'requesting') && <Skeleton active />}
        {(commentRsp.stage === 'done') && (
          <div className="kkjn__comment-item">
            <CommentHeader commentRsp={commentRsp} />
            <ReadonlyEditor comment={commentRsp.data} />
          </div>
        )}
        {(commentRsp.stage === 'error') && (
          <Space direction='horizontal'>
            <WarningOutlined />
            <Typography.Text>{commentRsp.error}</Typography.Text>
          </Space>
        )}
      </div>
    </div>
  )
}

function CommentPost(props: CommentPostProps) {
  const { placeholder, collapsed, onPost, onCancel, onClick } = props;
  const { t } = useTranslation();
  const { authRsp } = useAuth();
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [posting, setPosting] = useState(false);
  const unmountCancel = useUnmountCancel();

  const handleSubmit = () => {
    const contentState = editorState.getCurrentContent();
    const raw = convertToRaw(contentState);

    const comment = {
      content: JSON.stringify(raw),
      plainText: contentState.getPlainText(),
    };
    
    setPosting(true);
    onPost(comment)
      .pipe(
        unmountCancel(),
        tap({
          next: _.partial(setPosting, false),
          error: _.partial(setPosting, false),
        }),
      )
      .subscribe({
        next: () => {
          setEditorState(EditorState.createEmpty());
          onCancel?.();
        },
        error: (err) => {
          const error = getRspError(err);
          if (error !== null) {
            notification.error({
              message: error,
            });
          }
        },
      })
  };

  if (authRsp.stage === 'done' && !authRsp.data.isLogin) {
    return null;
  }

  return (
    /** add "tabindex" to handle focus */
    <div className="kkjn__comment-post" onClick={onClick}>
      <Avatar userRsp={authRsp as any} size={30} />
      <CommentEditor
        className="kkjn__editor"
        editorState={editorState}
        onEditorStateChange={setEditorState}
        posting={posting}
        collapsed={collapsed}
        placeholder={placeholder ?? t("COMMENT_PLACEHOLDER")}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </div>
  )
}

const styleChildCommentList: React.CSSProperties = {
  marginLeft: '30px',
};

function CommentItem(props: CommentItemProps) {
  const {
    comment,
    onClickReply,
    showChildCounts = true
  } = props;
  const { t } = useTranslation();
  
  const { authRsp } = useAuth();

  const { remove } = useComment(comment.id);
  const commentRsp = useFetchResponse(comment);
  const { userRsp } = useUser(comment.userId);

  const [hovered, hoverProps] = useHover();

  const [removing, setRemoving] = useState(false);

  const [emitClickReply, replyClick$] = useObservableCallback<any>(
    event$ => event$,
  );

  const handleClickReplyButton = useCallback(() => {
    if (authRsp.stage !== 'done') {
      console.error('It\'s a bug');
      return;
    }
    if (userRsp.stage !== 'done') {
      console.error('It\'s a bug');
      return;
    }
    if (authRsp.data.isLogin) {
      onClickReply?.(comment, userRsp.data);
      emitClickReply(null);
    } else {
      authModal.open();
    }
  }, [authRsp]);

  const handleRemoveComment = useCallback(() => {
    setRemoving(true);
    remove()
      .pipe(
        tap({
          next: _.partial(setRemoving, false),
          error: _.partial(setRemoving, false),
        })
      )
      .subscribe({
        next: () => notification.success({ message: t("DELETE_COMMENT_SUCESS") }),
        error: err => notification.error({ message: t("DELETE_COMMENT_ERROR") + ": " + err })
      })
  }, [remove]);

  
  return (
    <div className="kkjn__comment-item">
      <div {...hoverProps}>
        <CommentHeader commentRsp={commentRsp} showReference={comment.parentId !== comment.referenceId} />
        <ReadonlyEditor comment={comment} className="kkjn__content" />
        <div className="kkjn__panel">
          {hovered && authRsp.data?.isLogin && (authRsp.data.id === comment.userId || authRsp.data.role === 0b11) && (
            <Popconfirm
              title={t("READY_TO_REMOVE")}
              placement='top'
              onConfirm={handleRemoveComment}
              okText={t("YES")}
              cancelText={t("NO")}
            >
              <Button loading={removing} danger={true} type='text' shape='circle' size='small' icon={<DeleteOutlined />}></Button>
            </Popconfirm>
          )}
          <Button
            disabled={removing}
            type='text'
            className={clsx('kkjn__button')}
            size='small'
            icon={<CommentOutlined />}
            onClick={handleClickReplyButton}  
          >{!!showChildCounts && ' ' + comment.childCounts}</Button>
        </div>
      </div>
      {comment.childCounts > 0 && userRsp.stage === 'done' && (
        <ChildCommentList
          style={styleChildCommentList}
          comment={comment}
          user={userRsp.data}
          replyClick$={replyClick$}
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
    id,
    className,
    style,
    showCommentReplyCounts = true,
    showCommentListHeader = true,
    onItemClickReply,
    postChild,
  } = props;
  
  const { commentsRsp, page, pageSize, total, haveData, changePage, create } = useCommentList(id);
  const { t } = useTranslation();

  const pagination = useMemo(() => ({
    simple: true,
    size: 'small' as const,
    pageSize: pageSize,
    total: total ?? 0,
    current: page,
    onChange: changePage
  }), [page, total, pageSize, changePage]);

  return (
    <div className={clsx('kkjn__list', className)} style={style}>
      {showCommentListHeader && (
        <div className="kkjn__header">
          <span className="kkjn__title">{t("COMMENT_LIST")}</span>
          {total !== undefined && <Badge count={total}></Badge>}
        </div>
      )}
      {(commentsRsp.stage === 'pending' || commentsRsp.stage === 'requesting') && !haveData && (
        <Skeleton active />
      )}
      {commentsRsp.stage === 'error' && (
        <Typography.Text>{commentsRsp.error}</Typography.Text>
      )}
      {(commentsRsp.stage === 'pending' || commentsRsp.stage === 'requesting' || commentsRsp.stage === 'done') && haveData && (
        <>
          <ConfigProvider renderEmpty={EmptyCommentList}>
            <List
              size='small'
              split={false}
              loading={(commentsRsp.stage === 'pending' || commentsRsp.stage === 'requesting')}
              itemLayout='vertical'
              pagination={pageSize >= (total ?? 0) ? undefined : pagination}
              dataSource={commentsRsp.data?.comments ?? []}
              renderItem={item => (
                <List.Item
                  key={item.id + '$' + item.childCounts}
                >
                  <CommentItem
                    comment={item}
                    showChildCounts={showCommentReplyCounts}
                    onClickReply={onItemClickReply}
                  />
                </List.Item>
              )}
            />
          </ConfigProvider>
          {postChild?.(create) ?? null}
        </>
      )}
    </div>
  )
}

function RootCommentList(props: RootCommentListProps) {
  const { className, style } = props;
  const [collapsedPost, setCollapsedPost] = useState(true);
  const handlePostFocus = useCallback(_.partial(setCollapsedPost, false), [setCollapsedPost]);

  return (
    <CommentListCore
      id={undefined}
      className={className}
      style={style}
      postChild={(create) => {
        const handlePost = _.partial(create, _, undefined);
        return (
          <CommentPost
            onPost={handlePost}
            collapsed={collapsedPost}
            onClick={handlePostFocus}
          />
        )
      }}
    />
  )
}

function ChildCommentList(props: ChildCommentListProps) {
  const { comment, user, className, style, replyClick$ } = props;
  const { t } = useTranslation();

  const [currentReply, setCurrentReply] = useState<{
    reference: TypeComment.Get | null;
    user: User.User | null;
    placeholder: string | undefined;
  }>({
    reference: null,
    user: null,
    placeholder: undefined,
  });

  const handleChangeReply = useCallback((comment: TypeComment.Get, user: User.User) => {
    if (comment.id === currentReply.reference?.id) {
      return;
    }
    const raw = JSON.parse(comment.content);
    const contentState = convertFromRaw(raw);
    const editorState = EditorState.createWithContent(contentState);
    const plainContent = editorState.getCurrentContent().getPlainText();
    const placeholder = sprintf(t("REPLY_COMMENT_TO_USER"), user.name, plainContent);
    setCurrentReply({
      reference: comment,
      user,
      placeholder,
    });
  }, [currentReply]);
  const handleHideReply = useCallback(() => {
    setCurrentReply({
      reference: null,
      user: null,
      placeholder: undefined,
    });
  }, []);
  
  useSubscription(replyClick$, _.partial(handleChangeReply, comment, user));

  return (
    <CommentListCore
      id={comment.id}
      className={className}
      showCommentListHeader={false}
      showCommentReplyCounts={false}
      style={style}
      onItemClickReply={handleChangeReply}
      postChild={(create) => {
        const handlePost = (comment: Pick<TypeComment.Create, 'content' | 'plainText'>) => {
          const { reference } = currentReply;
          if (!reference) {
            console.error('reference is null but call handlePost. It\'s a bug.');
            return throwError(() => new Error(t("UNKNOWN_ERROR")))
          }
          return create(comment, reference.id);
        };
        return !currentReply.reference ? null : (
          <CommentPost
            onPost={handlePost}
            onCancel={handleHideReply}
            placeholder={currentReply.placeholder}
          />
        )
      }}
    />
  )
}

export function Comment(props: CommentProps) {
  const { scope } = props;
  return (
    <CommentProvider scope={scope} >
      <div className="kkjn__comment">
        <RootCommentList />
      </div>
    </CommentProvider>
  )
}
