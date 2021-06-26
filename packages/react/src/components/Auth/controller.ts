import { AuthService } from 'keekijanai-client-core';
import { Auth, User } from 'keekijanai-type';
import { catchError, filter, mergeMap, startWith, tap } from 'rxjs/operators';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createNotNilContextState, useMemoExports, useRequestState } from '../../util';
import _ from 'lodash';
import { useObservableState } from 'observable-hooks';
import { of } from 'rxjs';
import { FetchResponse, mapToRsp, INIT_PENDING_FETCH_RESPONSE } from '../../util/request';
import { useRequest } from '../../core/request';


const authContext = createContext({
  authService: new AuthService(),
});

/** @deprecated */
export function useAuth() {
  const { authService } = useContext(authContext);
  const { user$, logout } = authService;

  const [authRsp] = useObservableState<FetchResponse<Auth.CurrentUser>, void>(
    () => user$
      .asObservable()
      .pipe(
        filter(x => x !== null) as any,
        mapToRsp(),
      ),
      INIT_PENDING_FETCH_RESPONSE
  );

  const exports = useMemoExports({
    authRsp,
    logout,
  });

  return exports;
}

export function useAuthV2() {
  const { authService } = useContext(authContext);
  const { user$, logout } = authService;

  const {
    data: user,
    loading,
    error
  } = useRequest(
    'get',
    () => user$
      .asObservable()
      .pipe(
        filter(x => x !== null),
      ),
    []
  )

  return {
    user,
    loading,
    error,
    logout,
  };
}

export function useOAuth2() {
  const { authService } = useContext(authContext);
  const { oauth2, onCallback } = authService;

  const exports = useMemoExports({
    oauth2,
    onCallback,
  });
  return exports;
}

export function useLegacyAuth() {
  const { authService } = useContext(authContext);
  const { legacyRegister, legacyAuth } = authService;

  const register = legacyRegister;
  const auth = legacyAuth;

  const exports = useMemoExports({
    register,
    auth,
  });
  return exports;
}
