import React, { useState, useCallback } from 'react';
import { Comment as TypeComment } from 'keekijanai-type';
import { SendOutlined } from '@ant-design/icons';
import { convertToRaw, EditorState } from 'draft-js';
import CommentEditor from './CommentEditor';
import { AvatarV2 } from '../../User/Avatar';
import { useAuthV2 } from '../../Auth/controller';
import { Button, Space } from '../../../ui';
import { useCommentContext } from '../controllers/context';
import { mergeStylesLeft, StylesProps } from '../../../util/style';
import _ from 'lodash';

import './CommentPost.scss';
import { useMountedState } from 'react-use';

interface CommentPostProps extends StylesProps {
  placeholder?: string;
  posting?: boolean;
  disabled?: boolean;
  onPost?: (comment: Pick<TypeComment.Create, 'content' | 'plainText'>) => Promise<void>;
  onCancel?: () => any;
}

function resetEditorState() {
  return EditorState.createEmpty();
}

export default function CommentPost(props: CommentPostProps) {
  const {
    placeholder,
    onPost,
    onCancel,
  } = props;
  const { t } = useCommentContext();
  const [editorState, setEditorState] = useState(resetEditorState);
  const { user } = useAuthV2();
  const mounted = useMountedState();

  const disabled = props.disabled || props.posting;
  const posting = props.posting;

  const handlePost = useCallback(async () => {
    if (onPost) {
      const contentState = editorState.getCurrentContent();
      const plainText = contentState.getPlainText();
      const content = JSON.stringify(convertToRaw(contentState));
  
      await onPost({
        content,
        plainText,
      }).then(() => {
        if (mounted()) {
          setEditorState(resetEditorState);
        }
      }).catch(_.noop);
    }
  }, [editorState, onPost]);

  if (!user?.isLogin) {
    return null;
  }

  return (
    <Space direction="horizontal" {...mergeStylesLeft("kkjn__comment-post__container", undefined, props)}>
      <AvatarV2 user={user} size={20} />
      <CommentEditor
        editorState={editorState}
        onEditorStateChange={setEditorState}
        placeholder={placeholder}
      />
      <Space gap='xs'>
        {onPost && (
          <Button
            type='contained'
            label={t("POST_COMMENT")}
            prefix={<SendOutlined />}
            loading={posting}
            disabled={disabled}
            onClick={handlePost}
          />
        )}
        {onCancel && (
          <Button
            label={t("CANCEL")}
            onClick={onCancel}
            disabled={posting}
          />
        )}
      </Space>
    </Space>
  )
}
