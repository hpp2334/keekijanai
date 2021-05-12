import React, {  } from 'react';
import { I18nextProvider } from 'react-i18next';
import { SingletonAuthComponent } from './components/Auth/Auth';
import i18n from './translations/i18n';

interface ContextProps {
  children: React.ReactNode;
}

export function Context(props: ContextProps) {
  const { children } = props;
  return (
    <I18nextProvider i18n={i18n}>
      <SingletonAuthComponent />
      {children}
    </I18nextProvider>
  )
}
