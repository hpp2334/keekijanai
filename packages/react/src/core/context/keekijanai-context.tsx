import React from 'react';
import { useContext } from 'react';
import { notification as defaultNotification, NotificationType } from '../notification';
import { ConfigType, Client } from 'keekijanai-client-core';
import { useMount } from 'react-use';
import { useMemo } from 'react';
import { AuthModal, AuthModalProps, } from '../../components/Auth';
import { TranslationContext } from '../translation';
import _ from 'lodash';
import { useState } from 'react';
import { RegisteredContext } from './manager';

interface KeekijanaiConextValue {
  notification: NotificationType;
  client: Client;
}

export interface KeekijanaiContextProps {
  clientCoreOptions: ConfigType;
  authModalOptions?: AuthModalProps;
  notification?: NotificationType;
  children?: React.ReactNode;
}

const keekijanaiContext = React.createContext<KeekijanaiConextValue | null>(null);

export const useKeekijanaiContext = () => {
  const ctx = useContext(keekijanaiContext);

  if (!ctx) {
    throw Error('context is null');
  }

  return ctx;
}

export const KeekijanaiContext = (props: KeekijanaiContextProps) => {
  const { notification, clientCoreOptions, authModalOptions, children } = props;
  const [client] = useState(() => {
    const client = new Client(clientCoreOptions);
    return client;
  });

  const ctxValue: KeekijanaiConextValue = useMemo(() => {
    function customizer(objValue: any, srcValue: any) {
      return _.isUndefined(objValue) ? srcValue : objValue;
    }
    return _.assignWith(
      {
        notification: defaultNotification,
      },
      {
        notification,
        client,
      },
      customizer,
    );
  }, [notification]);

  return (
    <TranslationContext>
      <keekijanaiContext.Provider value={ctxValue}>
        <RegisteredContext>
          {children}
          <AuthModal {...authModalOptions} />
        </RegisteredContext>
      </keekijanaiContext.Provider>
    </TranslationContext>
  )
};
