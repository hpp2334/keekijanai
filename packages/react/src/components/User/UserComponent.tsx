import { Skeleton, Typography } from 'antd';
import clsx from 'clsx';
import { User } from 'keekijanai-type';
import React from 'react'
import { FetchResponse } from '../../util/request';
import { TranslationContext } from '../../translations';
import { Avatar, AvatarLoading, AvatarV2 } from './Avatar'
import { UserHookObject } from './controller'

import './UserComponent.css';
import { mergeStyles } from '../../util/style';

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


interface UserComponentV2Props {
  user: User.User | null | undefined;

  showAvatar?: boolean;

  classes?: {
    avatar?: string;
    container?: string;
    userName?: string;
  }
}

interface UserComponentLoadingProps {
  avatarSize: number;
  classes?: {
    avatar?: string;
    container?: string;
    userName?: string;
  }
}

/** @deprecated */
export function UserComponent(props: UserComponentProps) {
  const { userRsp, avatarSize, showAvatar = true, avatarClassName, avatarStyle, userNameClassName, userNameStyle, containerClassName, containerStyle } = props;

  return (
    <TranslationContext>
      <span className={clsx('kkjn__user-component', containerClassName)} style={containerStyle}>
        {showAvatar && <Avatar userRsp={userRsp} size={avatarSize ?? 20} className={clsx(avatarClassName)} style={avatarStyle} />}
        {(userRsp.stage === 'pending' || userRsp.stage === 'requesting') && <Skeleton.Input className={clsx("kkjn__username", userNameClassName)} style={{ width: '50px' }} size='small' active />}
        {userRsp.stage === 'done' && !!userRsp.data && (
          <Typography.Text className={clsx("kkjn__username", userNameClassName)} style={userNameStyle}>{userRsp.data.name}</Typography.Text>
        )}
      </span>
    </TranslationContext>
  )
}

export function UserComponentLoading(props: UserComponentLoadingProps) {
  const { avatarSize, classes } = props;

  return (
    <span {...mergeStyles(undefined, ['kkjn__user-component kkjn__skeleton', classes?.container])}>
      <AvatarLoading size={avatarSize} />
      <Skeleton.Input {...mergeStyles(undefined, ["kkjn__username", classes?.userName])} size='small' active />
    </span>
  )
}

export function UserComponentV2(props: UserComponentV2Props) {
  const { user, showAvatar = true, classes } = props;

  return (
    <TranslationContext>
      <span {...mergeStyles(undefined, ['kkjn__user-component', classes?.container])}>
        {showAvatar && <AvatarV2 user={user} size={20} {...mergeStyles(undefined, [classes?.avatar])} />}
        <Typography.Text {...mergeStyles(undefined, ["kkjn__username", classes?.userName])}>{user?.name ?? "Unknown User"}</Typography.Text>
      </span>
    </TranslationContext>
  )
}
