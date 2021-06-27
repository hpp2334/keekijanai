import { contextManager } from '../../core/context';
import { UserContext } from './context';

contextManager.pushContext(UserContext);

export { Avatar } from './Avatar';
export { UserComponent } from './UserComponent';

export type { AvatarProps } from './Avatar';
