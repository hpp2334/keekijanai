import React from 'react';
import { useContext } from 'react';
import { notification, NotificationType } from '../notification';
import { ConfigType, getClient as getClientCore } from 'keekijanai-client-core';
import { useMount } from 'react-use';
import { useMemo } from 'react';
import { AuthModalOptions, initAuthModal } from '../../components/Auth';
import { TranslationContext } from '../translation';
import _ from 'lodash';

interface KeekijanaiConextValue {
  notification: NotificationType;
}

export interface KeekijanaiContextProps {
  clientCoreOptions?: ConfigType;
  authModalOptions?: AuthModalOptions;
  notification?: NotificationType;
  children?: React.ReactNode;
}

const INIT_CONTEXT_VALUE: KeekijanaiConextValue = {
  notification,
}

const keekijanaiContext = React.createContext<KeekijanaiConextValue>(INIT_CONTEXT_VALUE);

/** @todo init in component */
let isInit = false;

export const useKeekijanaiContext = () => {
  const ctx = useContext(keekijanaiContext);
  return ctx;
}

export const KeekijanaiContext = (props: KeekijanaiContextProps) => {
  const { notification, clientCoreOptions, authModalOptions, children } = props;

  const ctxValue: KeekijanaiConextValue = useMemo(() => {
    function customizer(objValue: any, srcValue: any) {
      return _.isUndefined(objValue) ? srcValue : objValue;
    }
    return _.assignWith(
      INIT_CONTEXT_VALUE,
      {
        notification,
      },
      customizer,
    );
  }, [notification]);

  if (!isInit) {
    if (clientCoreOptions !== undefined) {
      const client = getClientCore();
      client.updateConfig(clientCoreOptions);
    }
    if (authModalOptions !== undefined) {
      initAuthModal(authModalOptions);
    }

    isInit = true;
  }

  return (
    <TranslationContext>
      <keekijanaiContext.Provider value={ctxValue}>
        {children}
      </keekijanaiContext.Provider>
    </TranslationContext>
  )
};
