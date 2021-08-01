import { DateText } from "../../Base/Date";
import { Comment as TypeComment, User } from 'keekijanai-type';
import { Popover } from 'antd';
import { UserComponentV2, useUserV2 } from "../../User";
import { UserComponentLoading } from "../../User/UserComponent";

import './CommentHeader.scss';

interface CommentHeaderProps {
  comment: TypeComment.Get;
  user: User.User;
  children?: React.ReactNode;
}

export default function CommentHeader(props: CommentHeaderProps) {
  const { comment, user } = props;
  
  return (
    <div className="kkjn__header">
      <UserComponentV2 user={user} avatarSize={20} />
      <DateText className="kkjn__header-datetext" timestamp={comment.cTime} />
      {props.children}
    </div>
  )
}