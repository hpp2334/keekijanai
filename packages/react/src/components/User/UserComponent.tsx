import { Skeleton, Typography } from 'antd';
import clsx from 'clsx';
import { User } from 'keekijanai-type';
import React from 'react'
import { FetchResponse } from '../../util/request';
import { TranslationContext } from '../../translations';
import { Avatar } from './Avatar'
import { UserHookObject } from './controller'

import './UserComponent.css';

interface UserComponentProps {
  userRsp: FetchResponse<User.User>;

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
  const { userRsp, avatarSize, showAvatar = true, avatarClassName, avatarStyle, userNameClassName, userNameStyle, containerClassName, containerStyle } = props;

  return (
    <TranslationContext>
      <span className={clsx('kkjn__user-component', containerClassName)} style={containerStyle}>
        {showAvatar && <Avatar userRsp={userRsp} size={avatarSize} className={clsx(avatarClassName)} style={avatarStyle} />}
        {(userRsp.stage === 'pending' || userRsp.stage === 'requesting') && <Skeleton.Input className={clsx("kkjn__username", userNameClassName)} style={{ width: '50px' }} size='small' active />}
        {userRsp.stage === 'done' && !!userRsp.data && (
          <Typography.Text className={clsx("kkjn__username", userNameClassName)} style={userNameStyle}>{userRsp.data.name}</Typography.Text>
        )}
      </span>
    </TranslationContext>
  )
}
