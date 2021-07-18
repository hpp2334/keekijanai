import { UserService } from 'keekijanai-client-core';
import { User } from 'keekijanai-type';
import { useObservable, useSubscription } from 'observable-hooks';
import { createContext, useContext, useState } from 'react';
import { filter, mergeMap } from 'rxjs/operators';
import { FetchResponse, INIT_PENDING_FETCH_RESPONSE, mapToRsp } from '../../util/request';
import { useMemoExports } from '../../util';
import { contextManager } from '../../core/context';

import { UserContext, useUserContext } from './context';
import { useRequestGet } from '../../core/request';
export * from './context';

/** @deprecated */
export function useUser(id: string | undefined) {
  const { userService } = useUserContext();
  const [userRsp, setUserRsp] = useState<FetchResponse<User.User>>(INIT_PENDING_FETCH_RESPONSE);

  const userRsp$ = useObservable<FetchResponse<User.User>, [string | undefined]>(
    inputs$ => inputs$.pipe(
      filter(([id]) => typeof id === 'string'),
      mergeMap(([id]) => userService
        .get(id as string)
        .pipe(
          mapToRsp(),
        )
      )
    ),
    [id]
  )
  useSubscription(userRsp$, setUserRsp);

  const exports = useMemoExports({ userRsp });
  return exports;
}


export function useUserV2(id: string) {
  const { userService } = useUserContext();

  const {
    data: user,
    loading,
    error
  } = useRequestGet(
    ([id]) => userService
      .get(id)
      .pipe(
        filter(x => x !== null),
      ),
    [id]
  );

  return {
    user,
    loading,
    error,
  };
}

export type UserHookObject = ReturnType<typeof useUser>;

