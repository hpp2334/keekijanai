import type React from "react";
import { I18nextProvider } from "react-i18next";
import { i18nInstance } from "./instance";

export const I18nProvider: React.FC<{}> = ({ children }) => {
  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
};
