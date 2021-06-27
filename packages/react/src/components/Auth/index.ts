import { contextManager } from '../../core/context';
import { AuthContext } from './context';
contextManager.pushContext(AuthContext);

export { Login } from './Auth';
export { useAuth, useLegacyAuth, useOAuth2 } from './controller';


export { AuthModal } from './AuthModal';
export type { AuthModalProps } from './AuthModal';

export type { LoginProps } from './Auth';
