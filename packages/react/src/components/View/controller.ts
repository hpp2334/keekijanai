import { ViewService } from 'keekijanai-client-core';
import { useCallback, useEffect, useState } from 'react';
import { createNotNilContextState, useMemoExports, useRequestState } from '../../util';

interface ContextValue {
  viewService: ViewService;
}

const [useViewContextValue, ViewProvider] = createNotNilContextState<ContextValue, { scope: string }>(
  (props) => ({
    viewService: new ViewService(props.scope),
  })
);

export {
  useViewContextValue,
  ViewProvider
}

export function useView() {
  const [view, setView] = useState<number>();
  const reqState = useRequestState();
  const { viewService } = useViewContextValue();
  const { loading } = reqState;

  const update = useCallback(() => {
    reqState.toloading();
    viewService
      .get()
      .subscribe({
        next: res => {
          setView(res.view);
          reqState.toDone();
        }
      })
  }, []);

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
