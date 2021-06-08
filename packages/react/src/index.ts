import './style.less';
import { getClient as getClientCore } from 'keekijanai-client-core';
import { initAuthModal } from './components/Auth';

export * from './components/Auth';
export * from './components/Comment';
export * from './components/User';
export * from './components/Star';
export * from './components/View';
export * from './components/CodeShow';

export function getClient() {
  return {
    core: getClientCore(),
    authModal: {
      init: initAuthModal,
    }
  }
}
