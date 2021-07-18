import { AuthService } from 'keekijanai-client-core';
import { Auth } from 'keekijanai-type';
import { filter } from 'rxjs/operators';
import React, { createContext, useContext } from 'react';
import { useMemoExports, useNotNilContextValueFactory } from '../../util';
import _ from 'lodash';
import { useObservableState } from 'observable-hooks';
import { FetchResponse, mapToRsp, INIT_PENDING_FETCH_RESPONSE } from '../../util/request';
import { useRequestGet } from '../../core/request';

import { AuthContext, useAuthContext } from './context';
export * from './context';

/** @deprecated */
export function useAuth() {
  const { authService } = useAuthContext();
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
  const { authService } = useAuthContext();
  const { user$, logout } = authService;

  const {
    data: user,
    loading,
    error
  } = useRequestGet(
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
  const { authService } = useAuthContext();
  const { oauth2, onCallback } = authService;

  const exports = useMemoExports({
    oauth2,
    onCallback,
  });
  return exports;
}

export function useLegacyAuth() {
  const { authService } = useAuthContext();
  const { legacyRegister, legacyAuth } = authService;

  const register = legacyRegister;
  const auth = legacyAuth;

  const exports = useMemoExports({
    register,
    auth,
  });
  return exports;
}
