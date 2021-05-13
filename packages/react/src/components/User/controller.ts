import { user as userService } from 'keekijanai-client-core';
import { User } from 'keekijanai-type';
import { useEffect, useState } from 'react';
import { forkJoin, of } from 'rxjs';
import { map, switchMapTo, tap } from 'rxjs/operators';
import { useMemoExports } from '../../util';

const userMap = new Map<string, User.User>();

export function batchUsers(ids: string[]) {
  const uniquedIds = Array.from(new Set(ids));

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

export function useUser(id: string) {
  const [user, setUser] = useState<User.User>();

  useEffect(() => {
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
      .subscribe(setUser)
  }, [id]);

  const exports = useMemoExports({ user });
  return exports;
}
