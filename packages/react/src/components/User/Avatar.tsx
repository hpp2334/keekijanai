import { Auth } from 'keekijanai-type';


export interface AvatarProps {
  user: Auth.CurrentUser;
}

export function Avatar(props: AvatarProps) {

  const { user } = props;

  if (!user.isLogin) {
    throw Error('user should login');
  }

  return (
    <img width="50px" height="50px" src={user.avatarUrl}></img>
  )
}
