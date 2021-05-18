import './style.less';

import { singletonModalManager } from './components/Base/SingletonModal';
import { authModalID, AuthComponent } from './components/Auth/AuthModal';

singletonModalManager.register(authModalID, AuthComponent)

export * from './components/Auth';
export * from './components/Comment';
export * from './components/User';
export * from './components/Star';
export * from './components/View';

export { Context } from './context';
export { client } from 'keekijanai-client-core';
