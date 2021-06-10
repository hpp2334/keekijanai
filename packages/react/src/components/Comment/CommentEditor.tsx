import { BoldOutlined, ItalicOutlined, LoadingOutlined, SendOutlined, StrikethroughOutlined, UnderlineOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import { Editor, EditorState, RichUtils } from 'draft-js';
import _ from 'lodash';
import React, { forwardRef, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import './CommentEditor.css';


interface CommentEditorProps {
  editorState: EditorState;
  onEditorStateChange: (editorState: EditorState) => void;
  placeholder?: string;
  readonly?: boolean;
  onClose?: () => void;
  onSubmit?: () => void;
  posting?: boolean;
  className?: string;
}

interface CommentEditorContentProps {
  editorState: EditorState;
  onEditorStateChange: (editorState: EditorState) => void;
  readonly?: boolean;
  placeholder?: string;
}

type EditorButtonProps = {
  prefix?: React.ReactNode;
  label?: string;
  disabled?: boolean;
} & ({
  type: 'switch';
  active?: boolean;
  onToggle?: () => void;
} | {
  type?: 'click';
  loading?: boolean;
  onClick?: () => void;
})
 
function EditorButton(props: EditorButtonProps) {
  const { prefix, label, disabled } = props;
  const active = (props.type === 'switch' && props.active) ?? false;
  const loading = ((props.type === 'click' || props.type === undefined) && props.loading) ?? false;
  const handler = props.type === 'switch' ? props.onToggle : props.onClick;

  const finalDisabled = disabled || loading;

  return (
    <button
      onClick={handler}
      disabled={finalDisabled}
      className={clsx(
        !finalDisabled ? "kkjn__button" : "kkjn__button-disabled",
        active ? "kkjn__button-active" : ""
      )}
    >
      {(loading ? <LoadingOutlined /> : prefix) ?? null}
      {label?.toUpperCase() ?? null}
    </button>
  )
}


const switchButtons = [
  { key: 'bold', prefix: <BoldOutlined />, style: 'BOLD' },
  { key: 'italic', prefix: <ItalicOutlined />, style: 'ITALIC' },
  { key: 'underline', prefix: <UnderlineOutlined />, style: 'UNDERLINE' },
  { key: 'strike-through-out', prefix: <StrikethroughOutlined />, style: 'STRIKE_THROUGH' },
];

const styleMap: Record<string, React.CSSProperties> = {
  'BOLD': {
    fontWeight: 700,
  },
  'STRIKE_THROUGH': {
    textDecoration: 'line-through',
  }
}

export const CommentEditorContent = forwardRef<Editor, CommentEditorContentProps>((props, ref) => {
  const {
    editorState,
    onEditorStateChange,
    readonly,
    placeholder,
  } = props;

  return (
    <Editor
      placeholder={placeholder}
      ref={ref}
      customStyleMap={styleMap}
      editorState={editorState}
      readOnly={readonly}
      onChange={onEditorStateChange}
    />
  )
});

export function CommentEditor(props: CommentEditorProps) {
  const {
    editorState,
    onEditorStateChange,
    placeholder,
    onClose,
    onSubmit,
    posting,
    className,
  } = props;
  const { t } = useTranslation();
  const ref = useRef<Editor>(null);

  const onChange = useCallback((editorState: EditorState) => {
    onEditorStateChange(editorState);
  }, [onEditorStateChange]);

  const handleFocus = () => {
    const editor = ref.current;
    editor?.focus();
  }

  const handleSubmit = () => {
    onSubmit?.();
  }

  const currentStyle = editorState.getCurrentInlineStyle();
  const empty = !editorState.getCurrentContent().hasText();

  const toggleInlineStyle = useCallback(
    (inlineStyle: string) => {
      const nextEditorState = RichUtils.toggleInlineStyle(editorState, inlineStyle);
      onChange(nextEditorState);
    },
    [editorState, onChange]
  );

  return (
    <div className={clsx("kkjn__comment-editor", className ?? "")}>
      <div className="kkjn__container" onClick={handleFocus}>
        <CommentEditorContent
          placeholder={placeholder}
          ref={ref}
          editorState={editorState}
          onEditorStateChange={onEditorStateChange}
        />
      </div>
      <div className="kkjn__toolbar">
        <div className="kkjn__toolbar-style">
          {switchButtons.map(item => (
            <EditorButton
              type='switch'
              key={item.key}
              prefix={item.prefix}
              active={currentStyle.has(item.style)}
              onToggle={_.partial(toggleInlineStyle, item.style)}
            />
          ))}
        </div>
        <div className="kkjn__toolbar-post">
          {onClose && (
            <EditorButton
              label={t("CANCEL")}
              onClick={onClose}
              disabled={posting}
            />
          )}
          {onSubmit && (
            <EditorButton
              prefix={<SendOutlined />}
              label={t("POST_COMMENT")}
              onClick={handleSubmit}
              loading={posting}
              disabled={empty}
            />
          )}
        </div>
      </div>
    </div>
  )
}