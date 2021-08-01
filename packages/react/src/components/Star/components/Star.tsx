

import { notification } from '../../../core/notification';
import { Auth, Star as StarType } from 'keekijanai-type';

import './Star.scss';
import React, { useCallback, useState } from 'react';
import { DislikeOutlined, LikeOutlined, MehOutlined } from '@ant-design/icons';
import { Button, Statistic } from 'antd';

interface StarCoreProps {
  loading: boolean;
  error: string | null;
  posting: boolean;
  
  star: StarType.Get;
  onPost: (next: StarType.StarType) => void;
}

export const StarCore = function (props: StarCoreProps) {
  const {
    loading,
    error,
    star,
    posting,
    onPost,
  } = props;

  const getButtonClassName = useCallback((val: StarType.StarType) => {
    return !loading && star.current === val ? 'kkjn__btn-activated' : 'kkjn__btn-unactivated';
  }, [loading, star]);

  const getProps = useCallback(
    (value: 1 | 0 | -1, icon: React.ReactNode) => ({
      disabled: posting || loading,
      shape: 'round' as const,
      size: 'large' as const,
      type: 'text' as const,
      icon,
      className: getButtonClassName(value),
      onClick: () => {
        onPost(value);
      },
    }),
    [posting, loading, getButtonClassName, onPost],
  );

  if (error) {
    return <>{error}</>;
  }

  return (
    <div className="kkjn__star">
      <Statistic className="kkjn__stat" value={!loading ? star.total : '...'} />
      <div>
        <Button {...getProps(1, <LikeOutlined />)} />
        <Button {...getProps(0, <MehOutlined />)} />
        <Button {...getProps(-1, <DislikeOutlined />)} />
      </div>
    </div>
  )
};
