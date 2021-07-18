import React, { useMemo } from 'react';
import { Comment as TypeComment, User } from 'keekijanai-type';
import { useArticleContext } from '../../Article';
import { useAuthV2 } from '../../Auth/controller';
import { Popconfirm } from 'antd';
import { useCommentContext } from '../controllers/context';
import { Button } from '../../../ui/Button';
import { CommentOutlined, DeleteOutlined } from '@ant-design/icons';
import CommentEditor from './CommentEditor';
import { convertFromRaw, EditorState } from 'draft-js';
import CommentHeader from './CommentHeader';

import './CommentItem.scss';

interface CommentItemPanelProps {
  childCounts?: number;
  onClickReply?: () => void;
  onClickRemove?: () => void;
  canRemove?: boolean;
  removing?: boolean;
  disabled?: boolean;
}

interface CommentItemProps {
  comment: TypeComment.Get;
  user: User.User;
  panel?: {
    showChildCounts?: boolean;
    onClickReply?: (comment: TypeComment.Get, user: User.User) => void;
    onClickRemove?: (comment: TypeComment.Get, user: User.User) => void;
    canRemove?: boolean;
    removing?: boolean;
    disabled?: boolean;
  };
}

function CommentItemPanel(props: CommentItemPanelProps) {
  const {
    childCounts,
    onClickReply,
    onClickRemove,
    canRemove,
    removing,
  } = props;
  const { t } = useCommentContext();
  const disabled = props.removing || props.disabled;

  return (
    <div className="kkjn__panel">
      {canRemove && (
        <Popconfirm
          title={t("READY_TO_REMOVE")}
          placement='top'
          onConfirm={onClickRemove}
          okText={t("YES")}
          cancelText={t("NO")}
        >
          <Button disabled={disabled} loading={removing} prefix={<DeleteOutlined />} />
        </Popconfirm>
      )}
      <Button
        disabled={disabled}
        prefix={<CommentOutlined />}
        label={childCounts?.toString()}
        onClick={onClickReply}
      />
    </div>
  )
}

export default function CommentItem(props: CommentItemProps) {
  const {
    comment,
    user,
    panel,
  } = props;
  
  if (panel) {
    panel.showChildCounts ??= true;
  }

  const { t } = useArticleContext();

  const editorState = useMemo(() => {
    const raw = JSON.parse(comment.content);
    const contentState = convertFromRaw(raw);
    return EditorState.createWithContent(contentState);
  }, [comment]);

  return (
    <div className="kkjn__comment-item">
      <CommentHeader comment={comment} user={user} />
      <CommentEditor className="kkjn__comment-editor" editorState={editorState} readMode={true} />
      {panel && (
        <CommentItemPanel
          {...panel}
          childCounts={panel.showChildCounts ? comment.childCounts : undefined}
          onClickReply={() => panel.onClickReply?.(comment, user)}
          onClickRemove={() => panel.onClickRemove?.(comment, user)}
        />
      )}
    </div>
  )
}
