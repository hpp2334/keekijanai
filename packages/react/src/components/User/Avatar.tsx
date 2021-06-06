import { Skeleton } from 'antd';
import clsx from 'clsx';
import { User } from 'keekijanai-type';
import { TranslationContext } from '../../translations';

import './Avatar.css';
import { UserHookObject } from './controller';


export interface AvatarProps {
  user: User.User | undefined;
  loading: UserHookObject['loading'];
  size?: number;

  className?: string;
  style?: React.CSSProperties;
}

export function Avatar(props: AvatarProps) {
  const { user, loading, size = 50, className, style } = props;

  return (
    <TranslationContext>
      <span className="kkjn__avatar">
        {loading === 'loading' && <Skeleton.Avatar shape='circle' size={size} active />}
        {loading === 'done' && user && (
          <img className={clsx(className)} style={style} width={size + 'px'} height={size + 'px'} src={user.avatarUrl}></img>
        )}
      </span>
    </TranslationContext>
  )
}
