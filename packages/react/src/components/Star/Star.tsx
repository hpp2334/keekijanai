import React from 'react';
import { Button, Statistic } from 'antd';
import { MehOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import { StarProvider, useStar } from './controller';
import { useCallback } from 'react';

import './Star.css';
import { useAuth } from '../Auth';
import { authModal } from '../Auth/AuthModal';
import { withContexts } from '../../util';
import { TranslationContext } from '../../translations';

export interface StarProps {
  /** id，如可取 location.pathname */
  scope: string;
}

export const Star = withContexts<StarProps>(
  TranslationContext,
  StarProvider,
)(function (props) {
  const star = useStar();
  const { user } = useAuth();

  const getButtonClassName = useCallback((val: any) => {
    return star.current === val ? 'kkjn__btn-activated' : 'kkjn__btn-unactivated';
  }, [star]);

  const getProps = useCallback(
    (value: 1 | 0 | -1, icon: React.ReactNode) => ({
      disabled: star.loading === 'loading',
      shape: 'round' as const,
      size: 'large' as const,
      type: 'text' as const,
      icon,
      className: getButtonClassName(value),
      onClick: () => {
        if (user.isLogin) {
          star.post(value);
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
        <Button {...getProps(1, <LikeOutlined />)} />
        <Button {...getProps(0, <MehOutlined />)} />
        <Button {...getProps(-1, <DislikeOutlined />)} />
      </div>
    </div>
  )
})
