import { view as viewService } from 'keekijanai-client-core';
import { useCallback, useEffect, useState } from 'react';
import { useMemoExports } from '../../util';

export function useView(scope: string) {
  const [view, setView] = useState<number>();

  const update = useCallback(() => {
    viewService
      .get(scope)
      .subscribe({
        next: setView
      })
  }, [scope]);

  useEffect(() => {
    update();
  }, [update]);

  const exports = useMemoExports({
    view,
    update,
  });
  return exports;
}
