import { Skeleton, Avatar as AntdAvatar } from 'antd';
import clsx from 'clsx';
import { User } from 'keekijanai-type';
import { FetchResponse } from '../../util/request';

import './Avatar.css';
import { UserHookObject } from './controller';
import { UserOutlined } from '@ant-design/icons';
import { StylesProps } from '../../util/style';


export interface AvatarProps {
  userRsp: FetchResponse<User.User>
  size: number;

  className?: string;
  style?: React.CSSProperties;
}

export interface AvatarV2Props extends StylesProps {
  user: User.User | undefined | null;
  size: number;
}

export interface AvatarLoadingProps {
  size: number;
}

/** @deprecated */
export function Avatar(props: AvatarProps) {
  const { userRsp, size, className, style } = props;

  return (
    <span className="kkjn__avatar">
      {(userRsp.stage === 'pending' || userRsp.stage === 'requesting') && <Skeleton.Avatar shape='circle' size={size} active />}
      {userRsp.stage === 'done' && !!userRsp.data && (
        <AntdAvatar className={clsx(className)} style={style} shape='circle' size={size} src={userRsp.data.avatarUrl} />
      )}
      {userRsp.stage === 'done' && !userRsp.data && (
        <AntdAvatar className={clsx(className)} style={style} shape='circle' size={size} icon={<UserOutlined />} />
      )}
    </span>
  )
}

export function AvatarV2(props: AvatarV2Props) {
  const { user, size, className, style } = props;
  
  return (
    <span className="kkjn__avatar">
      {user && (
        <AntdAvatar className={clsx(className)} style={style} shape='circle' size={size} src={user.avatarUrl} />
      )}
      {!user && (
        <AntdAvatar className={clsx(className)} style={style} shape='circle' size={size} icon={<UserOutlined />} />
      )}
    </span>
  )
}

export function AvatarLoading(props: AvatarLoadingProps) {
  const { size } = props;

  return (
    <span className="kkjn__avatar">
      <Skeleton.Avatar shape='circle' size={size} active />
    </span>
  )
}
