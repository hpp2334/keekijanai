import { UserService } from 'keekijanai-client-core';
import { User } from 'keekijanai-type';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { forkJoin, of } from 'rxjs';
import { map, switchMapTo, tap } from 'rxjs/operators';
import { createNotNilContextState, useMemoExports, useRequestState } from '../../util';

export const userContext = createContext({
  userService: new UserService(),
})

export function useUser(id: string | undefined) {
  const { userService } = useContext(userContext);
  const [user, setUser] = useState<User.User>();
  const reqState = useRequestState();
  const { loading, lastError } = reqState;

  const update = useCallback((id: string) => {
    userService
      .get(id)
      .subscribe({
        next: user => {
          setUser(user);
          reqState.toDone();
        },
        error: err => {
          reqState.toError(err);
        }
      });
  }, []);

  useEffect(() => {
    if (id !== undefined) {
      update(id);
    }
  }, [id]);

  const exports = useMemoExports({ user, loading, lastError, update });
  return exports;
}

export type UserHookObject = ReturnType<typeof useUser>;

