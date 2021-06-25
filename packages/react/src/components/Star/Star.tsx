import React, { useState } from 'react';
import { Button, notification, Statistic } from 'antd';
import { MehOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import { StarProvider, useStar } from './controller';
import { useCallback } from 'react';
import _ from 'lodash';

import './Star.css';
import { useAuth } from '../Auth';
import { authModal } from '../Auth/AuthModal';
import { getRspError } from '../../util/request';

export interface StarProps {
  /** id，如可取 location.pathname */
  scope: string;
}

export const StarCore = function () {
  const { starRsp, post } = useStar();
  const { authRsp } = useAuth();
  const [posting, setPosting] = useState(false);

  const getButtonClassName = useCallback((val: any) => {
    return starRsp.stage === 'done' && starRsp.data.current === val ? 'kkjn__btn-activated' : 'kkjn__btn-unactivated';
  }, [starRsp]);

  const getProps = useCallback(
    (value: 1 | 0 | -1, icon: React.ReactNode) => ({
      disabled: posting || (starRsp.stage === 'pending' || starRsp.stage === 'requesting'),
      shape: 'round' as const,
      size: 'large' as const,
      type: 'text' as const,
      icon,
      className: getButtonClassName(value),
      onClick: () => {
        if (authRsp.stage === 'done' && authRsp.data.isLogin) {
          setPosting(true);
          post(value).subscribe({
            next: () => {
              setPosting(false);
            },
            error: err => {
              setPosting(false);
              const error = getRspError(err);
              if (error !== null) {
                notification.error({
                  message: error,
                });
              }
            },
          });
        } else {
          authModal.open();
        }
      },
    }),
    [starRsp, authRsp, posting, getButtonClassName, post]
  );

  return (
    <div className="kkjn__star">
      <Statistic className="kkjn__stat" value={starRsp.stage === 'done' ? starRsp.data.total : 0} />
      <div>
        <Button {...getProps(1, <LikeOutlined />)} />
        <Button {...getProps(0, <MehOutlined />)} />
        <Button {...getProps(-1, <DislikeOutlined />)} />
      </div>
    </div>
  )
};

export function Star(props: StarProps) {
  const { scope } = props;
  return (
    <StarProvider scope={scope}>
      <StarCore />
    </StarProvider>
  )
}
