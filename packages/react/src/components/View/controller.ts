import { view as viewService } from 'keekijanai-client-core';
import { useCallback, useEffect, useState } from 'react';
import { useMemoExports, useRequestState } from '../../util';

export function useView(scope: string) {
  const [view, setView] = useState<number>();
  const reqState = useRequestState();
  const { loading } = reqState;

  const update = useCallback(() => {
    reqState.toloading();
    viewService
      .get(scope)
      .subscribe({
        next: res => {
          setView(res.view);
          reqState.toDone();
        }
      })
  }, [scope]);

  useEffect(() => {
    update();
  }, [update]);

  const exports = useMemoExports({
    view,
    loading,
    update,
  });
  return exports;
}
