import clsx from 'clsx';
import React from 'react';
import { Button } from 'antd';
import { MehOutlined, LikeOutlined, UnlockOutlined } from '@ant-design/icons';
import { useStar } from './controller';
import { useCallback } from 'react';


export interface StarProps {
  scope: string;
}

export function Star(props: StarProps) {
  const { scope } = props;
  const star = useStar(scope);

  const getButtonType = useCallback((val: any) => {
    return star.current === val ? 'primary' : 'default';
  }, [star]);

  return (
    <div>
      <div>{star.current}</div>
      <div>
        <Button type={getButtonType(1)} icon={<LikeOutlined />} onClick={star.handlePostLike} />
        <Button type={getButtonType(0)} icon={<MehOutlined />} onClick={star.handlePostMama} />
        <Button type={getButtonType(-1)} icon={<UnlockOutlined />} onClick={star.handlePostUnlike} />
      </div>
    </div>
  )
}
