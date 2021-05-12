import { auth as authService } from 'keekijanai-client-core';
import { Auth } from 'keekijanai-type';
import { useCallback, useEffect, useState } from 'react';
import { useMemoExports } from '../../util';

export function useAuth() {
  const [user, setUser] = useState<Auth.CurrentUser>({ isLogin: false });

  useEffect(() => {
    authService.user$.subscribe({
      next: setUser,
    });
  }, []);


  const exports = useMemoExports({
    user,
    onCallback: authService.onCallback,
  });

  return exports;
}
