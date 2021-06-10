import { View } from 'keekijanai-type';
import { useObservable, useSubscription } from 'observable-hooks';
import { useState } from 'react';
import { FetchResponse, INIT_PENDING_FETCH_RESPONSE, mapToRsp } from '../../util/request';
import { useMemoExports } from '../../util';
import { useViewContextValue } from './context';

export { ViewProvider, useViewContextValue } from './context';

export function useView() {
  const [viewRsp, setViewRsp] = useState<FetchResponse<View.Get>>(INIT_PENDING_FETCH_RESPONSE);
  const { viewService } = useViewContextValue();
  const view$ = useObservable(
    () => viewService
      .get()
      .pipe(
        mapToRsp(),
      ),
    []
  );

  useSubscription(view$, setViewRsp);

  const exports = useMemoExports({
    viewRsp
  });
  return exports;
}
