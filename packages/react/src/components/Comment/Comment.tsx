import './Comment.css';
import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Popover, Button, Typography, List, ConfigProvider, Popconfirm, notification, Badge, Space, Skeleton } from 'antd';
import { Translation, useTranslation } from 'react-i18next';
import {
  useComment,
  useCommentList, CommentProvider
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
import _, { startsWith } from 'lodash';
import { Observable } from 'rxjs';
import { TranslationContext } from '../../translations';
import { FetchResponse, useFetchResponse } from '../../util/request';

const Editor = loadable(() => import('react-draft-wysiwyg' as any).then(v => v.Editor));

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
}

interface CommentListProps {
  id: number | undefined;

  showCommentListHeader?: boolean;
  showCommentReplyCounts?: boolean;
  showPost?: boolean;

  className?: string;
  style?: React.CSSProperties;
}

interface CommentPostProps {
  placeholder?: string;
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
  const { placeholder, onPost, onCancel } = props;
  const { t } = useTranslation();
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
          notification.error({
            message: err?.response?.error ?? err?.message ?? err,
          });
        },
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
    comment,
    showChildCounts = true
  } = props;
  const { t } = useTranslation();
  
  const { authRsp } = useAuth();

  const { remove, reply } = useComment(comment.id);
  const commentRsp = useFetchResponse(comment);
  const { userRsp } = useUser(comment.userId);

  const [replyPlaceHolderMainText] = useState(() => {
    const raw = JSON.parse(comment.content);
    const contentState = convertFromRaw(raw);
    const editorState = EditorState.createWithContent(contentState);
    const plainContent = editorState.getCurrentContent().getPlainText();
    return plainContent;
  });
  const replyPlaceHolder = useMemo(() => {
    return sprintf(t("REPLY_COMMENT_TO_USER"), userRsp.data?.name, replyPlaceHolderMainText);
  }, [userRsp]);

  const [removing, setRemoving] = useState(false);
  const [showReply, setShowReply] = useState(false);

  const handleClickReplyButton = useCallback(() => {
    if (authRsp.stage !== 'done') {
      console.error('It\'s a bug');
      return;
    }
    if (authRsp.data.isLogin) {
      setShowReply(prev => !prev);
    } else {
      authModal.open();
    }
  }, [authRsp, setShowReply]);

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

  const handleReply = useCallback((created: Pick<TypeComment.Create, 'content' | 'plainText'>) => {
    const asParent = !comment.parentId;
    return reply(created, asParent);
  }, [reply]);

  const styleCommentList = useMemo((): React.CSSProperties => ({
    marginLeft: (comment.parentId ? 2 : 1) * 20 + 'px',
  }), []);
  
  return (
    <div className="kkjn__comment-item">
      <CommentHeader commentRsp={commentRsp} showReference={comment.parentId !== comment.referenceId} />
      <ReadonlyEditor comment={comment} />
      <div className="kkjn__panel">
        {authRsp.data?.isLogin && (authRsp.data.id === comment.userId || authRsp.data.role === 0b11) && (
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
          className={clsx(
            'kkjn__button',
            showReply ? 'kkjn__button-activated' : ''
          )}
          size='small'
          icon={<CommentOutlined />}
          onClick={handleClickReplyButton}  
        >{!!showChildCounts && ' ' + comment.childCounts}</Button>
      </div>
      {showReply && authRsp.data?.isLogin && (
        <CommentPost
          onPost={handleReply}
          onCancel={_.partial(setShowReply, false)}
          placeholder={replyPlaceHolder}
        />
      )}
      {!comment.parentId && comment.childCounts > 0 && (
        <CommentList
          id={comment.id}
          style={styleCommentList}
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

function CommentList(props: CommentListProps) {
  const {
    id,
    className,
    style,
    showCommentReplyCounts = true,
    showCommentListHeader = true,
    showPost = false,
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
                  />
                </List.Item>
              )}
            />
          </ConfigProvider>
          {showPost && <CommentPost onPost={create} />}
        </>
      )}
    </div>
  )
}

export function Comment(props: CommentProps) {
  const { scope } = props;
  return (
    <TranslationContext>
      <CommentProvider scope={scope} >
        <div className="kkjn__comment">
          <CommentList id={undefined} showPost={true} />
        </div>
      </CommentProvider>
    </TranslationContext>
  )
}
