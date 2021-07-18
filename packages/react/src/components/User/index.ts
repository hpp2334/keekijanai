import { contextManager } from '../../core/context';
import { UserContext } from './context';

contextManager.pushContext(UserContext);

export { Avatar } from './Avatar';
export { UserComponent, UserComponentV2 } from './UserComponent';

export { useUser, useUserV2 } from './controller';

export type { AvatarProps } from './Avatar';
