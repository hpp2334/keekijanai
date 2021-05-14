import { auth as authService } from 'keekijanai-client-core';
import { Auth } from 'keekijanai-type';
import { useCallback, useEffect, useState } from 'react';
import { useMemoExports, useRequestState } from '../../util';

let user: Auth.CurrentUser = { isLogin: false };
export function useAuth() {
  const loadingState = useRequestState();
  const { loading } = loadingState;

  useEffect(() => {
    authService.user$.subscribe({
      next: nextUser => {
        if (nextUser !== undefined) {
          user = nextUser;
          loadingState.toDone();
        }
      },
    });
  }, [loadingState.toDone]);


  const exports = useMemoExports({
    user,
    loading,
    onCallback: authService.onCallback,
  });

  return exports;
}
