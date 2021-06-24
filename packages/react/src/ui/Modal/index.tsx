import { CloseOutlined } from '@ant-design/icons';
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { mergeStyles, StylesProps } from '../../util/style';
import Button from '../Button/Button';

import './index.css';

interface ModalProps extends StylesProps {
  visible: boolean;
  onCancel: () => void;
  children?: React.ReactNode;
}

export default function Modal(props: ModalProps) {
  if (typeof document === 'undefined') {
    return null;
  }

  const {
    visible,
    onCancel,
    children,
  } = props;
  const refBody = useRef(document.querySelector('body'));
  const refEl = useRef(document.createElement('div'));

  const handleClickContainer: React.MouseEventHandler<HTMLDivElement> = (ev) => {
    ev.stopPropagation();
  }
  const handleClickMask: React.MouseEventHandler<HTMLElement> = (ev) => {
    onCancel();
  }

  useEffect(() => {
    const body = refBody.current;
    if (!body) {
      console.error('cannot found body');
      return;
    }

    body.appendChild(refEl.current);
    return () => {
      body.removeChild(refEl.current);
    }
  }, []);

  return ReactDOM.createPortal(
    <div {...mergeStyles(undefined, ["kkjn__modal kkjn__modal-mask", visible && "kkjn__visible"])} onClick={handleClickMask}>
      <div onClick={handleClickContainer} {...mergeStyles(props, ["kkjn__modal-container"])}>
        <div className="kkjn__modal-container-header">
        <Button className="kkjn__modal-close-btn" prefix={<CloseOutlined />} onClick={handleClickMask} />
        </div>
        {children}
      </div>
    </div>,
    refEl.current,
  );
}
