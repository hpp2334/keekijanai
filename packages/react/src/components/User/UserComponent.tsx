import { Skeleton, Typography } from 'antd';
import clsx from 'clsx';
import React from 'react'
import { Avatar } from './Avatar'
import { UserHookObject } from './controller'

import './UserComponent.css';

interface UserComponentProps {
  userHookObject: UserHookObject;

  avatarSize?: number;
  showAvatar?: boolean;
  avatarClassName?: string;
  avatarStyle?: React.CSSProperties;

  userNameClassName?: string;
  userNameStyle?: React.CSSProperties;
}

export function UserComponent(props: UserComponentProps) {
  const { userHookObject, avatarSize, showAvatar = true, avatarClassName, avatarStyle, userNameClassName, userNameStyle } = props;
  const { user, loading } = userHookObject;

  return (
    <span className={clsx('__Keekijanai__User_UserComponent-container')}>
      {showAvatar && <Avatar userHookObject={userHookObject} size={avatarSize} className={clsx(avatarClassName)} style={avatarStyle} />}
      {loading === 'loading' && <Skeleton.Input style={{ width: '100px' }} size='small' />}
      {loading === 'done' && user && (
        <Typography.Text className={clsx("__Keekijanai__User_UserComponent-username", userNameClassName)} style={userNameStyle}>{user.name}</Typography.Text>
      )}
    </span>
  )
}
