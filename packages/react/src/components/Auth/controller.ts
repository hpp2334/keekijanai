import { auth as authService } from 'keekijanai-client-core';
import { Auth, User } from 'keekijanai-type';
import { tap } from 'rxjs/operators';
import { useCallback, useEffect, useState } from 'react';
import { useMemoExports, useRequestState } from '../../util';

export function useAuth() {
  const [user, setUser] = useState<Auth.CurrentUser>({ isLogin: false });
  const loadingState = useRequestState();
  const { loading } = loadingState;

  useEffect(() => {
    const subscription = authService.user$
      .pipe(
        tap(loadingState.toDone)
      )
      .subscribe(setUser);
    return () => {
      subscription.unsubscribe();
    }
  }, []);

  const update = useCallback(() => {
    loadingState.toloading();
    authService.updateCurrent().subscribe(loadingState.toDone);
  }, []);

  const onCallback = useCallback((cb: (redirect?: string) => void) => {
    update();
    authService.onCallback(cb);
  }, [update]);

  const exports = useMemoExports({
    user,
    loading,
    onCallback,
  });

  return exports;
}
