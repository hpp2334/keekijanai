import { User } from 'keekijanai-type';

import './Avatar.css';


export interface AvatarProps {
  user: User.User | undefined;
  size?: string;
}

export function Avatar(props: AvatarProps) {
  const { user, size = '50px' } = props;

  if (!user) {
    return null;
  }

  return (
    <img className='__Keekijanai__User__Avatar' width={size} height={size} src={user.avatarUrl}></img>
  )
}
