import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import LanguageDetector from 'i18next-browser-languagedetector';

import tEnUS from './en-US.json';
import tZhCN from './zh-CN.json';

const resources = {
  en: {
    translation: tEnUS,
  },
  cn: {
    translation: tZhCN,
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
  });

export default i18n;
