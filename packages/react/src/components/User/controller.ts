import { user as userService } from 'keekijanai-client-core';
import { User } from 'keekijanai-type';
import { useEffect, useState } from 'react';
import { useMemoExports } from '../../util';

export function useUser(id: string) {
  const [user, setUser] = useState<User.User>();

  useEffect(() => {
    userService
      .get(id)
      .subscribe({
        next: setUser,
      })
  }, [id]);

  const exports = useMemoExports({ user });
  return exports;
}
