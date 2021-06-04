import clsx from 'clsx';
import React, { useMemo } from 'react';
import { Button, Statistic } from 'antd';
import { MehOutlined, LikeOutlined, UnlockOutlined, DislikeOutlined } from '@ant-design/icons';
import { useStar } from './controller';
import { useCallback } from 'react';

import './Star.css';
import { useAuth } from '../Auth';
import { authModal } from '../Auth/AuthModal';

export interface StarProps {
  /** id，如可取 location.pathname */
  scope: string;
}

export function Star(props: StarProps) {
  const { scope } = props;
  const star = useStar(scope);
  const { user } = useAuth();


  const getButtonClassName = useCallback((val: any) => {
    return star.current === val ? 'kkjn__btn-activated' : 'kkjn__btn-unactivated';
  }, [star]);

  const getProps = useCallback(
    (value: number, icon: React.ReactNode, handleClick: () => void) => ({
      disabled: star.loading === 'loading',
      shape: 'round' as const,
      size: 'large' as const,
      type: 'text' as const,
      icon,
      className: getButtonClassName(value),
      onClick: () => {
        if (user.isLogin) {
          handleClick();
        } else {
          authModal.open();
        }
      },
    }),
    [user, getButtonClassName]
  );

  return (
    <div className="kkjn__star">
      <Statistic className="kkjn__stat" value={star.total} />
      <div>
        <Button {...getProps(1, <LikeOutlined />, star.handlePostLike)} />
        <Button {...getProps(0, <MehOutlined />, star.handlePostMama)} />
        <Button {...getProps(-1, <DislikeOutlined />, star.handlePostUnlike)} />
      </div>
    </div>
  )
}
