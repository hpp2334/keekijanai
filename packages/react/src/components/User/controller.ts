import { user as userService } from 'keekijanai-client-core';
import { User } from 'keekijanai-type';
import { useCallback, useEffect, useState } from 'react';
import { forkJoin, of } from 'rxjs';
import { map, switchMapTo, tap } from 'rxjs/operators';
import { useMemoExports, useRequestState } from '../../util';

const userMap = new Map<string, User.User>();

export function batchUsers(ids: string[]) {
  const uniquedIds = Array.from(new Set(ids));

  if (ids.length === 0) {
    return of(userMap);
  }

  return forkJoin(
    uniquedIds.map(id => {
      const cached = userMap.get(id);
      if (cached) {
        return of(cached);
      }

      return userService
        .get(id)
        .pipe(
          tap(user => {
            userMap.set(id, user);
          })
        )
    })
  ).pipe(
    switchMapTo(of(userMap))
  )
}

export function useUser(id?: string) {
  const [user, setUser] = useState<User.User>();
  const reqState = useRequestState();
  const { loading, lastError } = reqState;

  const update = useCallback((id: string) => {
    batchUsers([id])
      .pipe(
        map(userMap => {
          const user = userMap.get(id);
          if (!user) {
            throw Error('get user error');
          }
          return user;
        })
      )
      .subscribe({
        next: user => {
          setUser(user);
          reqState.toDone();
        },
        error: err => {
          reqState.toError(err);
        }
      })
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

