import React, { useState } from 'react';
import { Button, notification, Statistic } from 'antd';
import { MehOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import { StarContext, useStar } from '../controller';
import { useCallback } from 'react';
import _ from 'lodash';
import { useStarContext } from '../context';
import { authModal } from '../../../components/Auth/AuthModal';
import { useAuthV2 } from '../../../components/Auth/controller';
import { Star as StarType } from 'keekijanai-type';
import { StarCore } from '../components/Star';


export interface StarProps {
  /** id，如可取 location.pathname */
  scope: string;
}

function StarInner() {
  const authHook = useAuthV2();
  const {
    data,
    loading,
    error,
    posting,
    post,
  } = useStar();

  const onPost = useCallback((next: StarType.StarType) => {
    if (!loading && authHook.user?.isLogin) {
      post(next).subscribe({
        error: err => {
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
  }, [authHook.user, authHook.loading, post]);

  return (
    <StarCore loading={loading || authHook.loading} error={error} star={data} posting={posting} onPost={onPost} />
  )
}

export function Star(props: StarProps) {
  const { scope } = props;
  return (
    <StarContext scope={scope}>
      <StarInner />
    </StarContext>
  )
}
