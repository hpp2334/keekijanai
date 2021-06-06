import { Skeleton, Typography } from 'antd';
import clsx from 'clsx';
import { User } from 'keekijanai-type';
import React from 'react'
import { TranslationContext } from '../../translations';
import { Avatar } from './Avatar'
import { UserHookObject } from './controller'

import './UserComponent.css';

interface UserComponentProps {
  user: User.User | undefined;
  loading: UserHookObject['loading'];

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
  const { user, loading, avatarSize, showAvatar = true, avatarClassName, avatarStyle, userNameClassName, userNameStyle, containerClassName, containerStyle } = props;

  return (
    <TranslationContext>
      <span className={clsx('kkjn__user-component', containerClassName)} style={containerStyle}>
        {showAvatar && <Avatar user={user} loading={loading} size={avatarSize} className={clsx(avatarClassName)} style={avatarStyle} />}
        {loading === 'loading' && <Skeleton.Input className={clsx("kkjn__username", userNameClassName)} style={{ width: '50px' }} size='small' active />}
        {loading === 'done' && user && (
          <Typography.Text className={clsx("kkjn__username", userNameClassName)} style={userNameStyle}>{user.name}</Typography.Text>
        )}
      </span>
    </TranslationContext>
  )
}
