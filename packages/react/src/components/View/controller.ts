import { View } from 'keekijanai-type';
import { useObservable, useSubscription } from 'observable-hooks';
import { useState } from 'react';
import { FetchResponse, INIT_PENDING_FETCH_RESPONSE, mapToRsp } from '../../util/request';
import { useMemoExports } from '../../util';

import { ViewContext, useViewContext } from './context';
import { useRequestGet } from '../../core/request';
export * from './context';


export function useView() {
  const { viewService } = useViewContext();

  const {
    data,
    loading,
    error,
  } = useRequestGet(
    () => {
      return viewService.get();
    },
    {}
  );

  const exports = useMemoExports({
    data,
    loading,
    error,
  });
  return exports;
}
