import { AuthService } from 'keekijanai-client-core';
import { Auth, User } from 'keekijanai-type';
import { tap } from 'rxjs/operators';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createNotNilContextState, useMemoExports, useRequestState } from '../../util';
import _ from 'lodash';


const authContext = createContext({
  authService: new AuthService(),
});

export function useAuth() {
  const { authService } = useContext(authContext);
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

  const logout = authService.logout;
  const oauth = authService.oauth;

  const onCallback = useCallback((cb: (redirect?: string) => void) => {
    update();
    authService.onCallback(cb);
  }, [update]);

  const exports = useMemoExports({
    user,
    loading,
    onCallback,
    logout,
    oauth,
  });

  return exports;
}

export function useLegacyAuth() {
  const { authService } = useContext(authContext);
  const { legacyRegister, legacyAuth } = authService;

  const register = legacyRegister;
  const auth = useCallback(
    (userID: string, password: string) => {
      return legacyAuth(userID, password)
    }, [legacyAuth]
  );

  const exports = useMemoExports({
    register,
    auth,
  });
  return exports;
}
