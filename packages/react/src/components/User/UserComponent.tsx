import { Skeleton, Typography } from 'antd';
import clsx from 'clsx';
import React from 'react'
import { Avatar } from './Avatar'
import { UserHookObject } from './controller'

import './UserComponent.css';

interface UserComponentProps {
  userHookObject: Pick<UserHookObject, 'user' | 'loading'>;

  avatarSize?: number;
  showAvatar?: boolean;
  avatarClassName?: string;
  avatarStyle?: React.CSSProperties;

  userNameClassName?: string;
  userNameStyle?: React.CSSProperties;

  containerClassName?: string;
  containerStyle?: React.CSSProperties;
}

export function UserComponent(props: UserComponentProps) {
  const { userHookObject, avatarSize, showAvatar = true, avatarClassName, avatarStyle, userNameClassName, userNameStyle, containerClassName, containerStyle } = props;
  const { user, loading } = userHookObject;

  return (
    <span className={clsx('kkjn__user-component', containerClassName)} style={containerStyle}>
      {showAvatar && <Avatar userHookObject={userHookObject} size={avatarSize} className={clsx(avatarClassName)} style={avatarStyle} />}
      {loading === 'loading' && <Skeleton.Input className={clsx("kkjn__username", userNameClassName)} style={{ width: '50px' }} size='small' active />}
      {loading === 'done' && user && (
        <Typography.Text className={clsx("kkjn__username", userNameClassName)} style={userNameStyle}>{user.name}</Typography.Text>
      )}
    </span>
  )
}
