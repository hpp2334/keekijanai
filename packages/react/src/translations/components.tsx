import React from "react";
import { I18nextProvider } from "react-i18next";
import { i18n } from "./i18n";

interface Props {
  children?: React.ReactNode;
}

export function TranslationContext(props: Props) {
  const { children } = props;
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  )
}
