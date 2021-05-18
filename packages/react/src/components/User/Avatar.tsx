import { Skeleton } from 'antd';
import clsx from 'clsx';
import { User } from 'keekijanai-type';

import './Avatar.css';
import { UserHookObject } from './controller';


export interface AvatarProps {
  userHookObject: Pick<UserHookObject, 'user' | 'loading'>;
  size?: number;

  className?: string;
  style?: React.CSSProperties;
}

export function Avatar(props: AvatarProps) {
  const { userHookObject, size = 50, className, style } = props;

  return (
    <span className="kkjn__avatar">
      {userHookObject.loading === 'loading' && <Skeleton.Avatar shape='circle' size={size} active />}
      {userHookObject.loading === 'done' && userHookObject.user && (
        <img className={clsx(className)} style={style} width={size + 'px'} height={size + 'px'} src={userHookObject.user.avatarUrl}></img>
      )}
    </span>
  )
}
