import clsx from 'clsx';
import React from 'react';
import { Button, Statistic } from 'antd';
import { MehOutlined, LikeOutlined, UnlockOutlined, DislikeOutlined } from '@ant-design/icons';
import { useStar } from './controller';
import { useCallback } from 'react';

import './Star.css';

export interface StarProps {
  scope: string;
}

export function Star(props: StarProps) {
  const { scope } = props;
  const star = useStar(scope);

  const getButtonClassName = useCallback((val: any) => {
    return star.current === val ? '__Keekijanai__Star_star-btn-activated' : '__Keekijanai__Star_star-btn-unactivated';
  }, [star]);

  return (
    <div className="__Keekijanai__Star_container">
      <Statistic className="__Keekijanai__Star_stat" value={star.total} />
      <div>
        <Button disabled={star.loading === 'loading'} className={getButtonClassName(1)} shape='round' size='large' type='text' icon={<LikeOutlined />} onClick={star.handlePostLike} />
        <Button disabled={star.loading === 'loading'} className={getButtonClassName(0)} shape='round' size='large' type='text' icon={<MehOutlined />} onClick={star.handlePostMama} />
        <Button disabled={star.loading === 'loading'} className={getButtonClassName(-1)} shape='round' size='large' type='text' icon={<DislikeOutlined  />} onClick={star.handlePostUnlike} />
      </div>
    </div>
  )
}
