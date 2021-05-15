import React, {  } from 'react';
import { I18nextProvider } from 'react-i18next';
import { singletonModalManager } from './components/Base/SingletonModal';
import i18n from './translations/i18n';

interface ContextProps {
  children: React.ReactNode;
}

export function Context(props: ContextProps) {
  const { children } = props;
  return (
    <I18nextProvider i18n={i18n}>
      {children}
      <singletonModalManager.Components />
    </I18nextProvider>
  )
}
