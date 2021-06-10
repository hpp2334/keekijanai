import { Skeleton } from 'antd';
import clsx from 'clsx';
import { User } from 'keekijanai-type';
import { FetchResponse } from '../../util/request';
import { TranslationContext } from '../../translations';

import './Avatar.css';
import { UserHookObject } from './controller';


export interface AvatarProps {
  userRsp: FetchResponse<User.User>
  size?: number;

  className?: string;
  style?: React.CSSProperties;
}

export function Avatar(props: AvatarProps) {
  const { userRsp, size = 50, className, style } = props;

  return (
    <TranslationContext>
      <span className="kkjn__avatar">
        {(userRsp.stage === 'pending' || userRsp.stage === 'requesting') && <Skeleton.Avatar shape='circle' size={size} active />}
        {userRsp.stage === 'done' && !!userRsp.data && (
          <img className={clsx(className)} style={style} width={size} height={size} src={userRsp.data.avatarUrl}></img>
        )}
      </span>
    </TranslationContext>
  )
}
