import { UserService } from 'keekijanai-client-core';
import { User } from 'keekijanai-type';
import { useObservable, useSubscription } from 'observable-hooks';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { forkJoin, of } from 'rxjs';
import { filter, map, mergeMap, switchMapTo, tap } from 'rxjs/operators';
import { FetchResponse, INIT_PENDING_FETCH_RESPONSE, mapToRsp } from '../../util/request';
import { createNotNilContextState, useMemoExports, useRequestState } from '../../util';

export const userContext = createContext({
  userService: new UserService(),
})

export function useUser(id: string | undefined) {
  const { userService } = useContext(userContext);
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

export type UserHookObject = ReturnType<typeof useUser>;

