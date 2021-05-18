import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import LanguageDetector from 'i18next-browser-languagedetector';

import tEnUS from './en-US';
import tZhCN from './zh-CN';

const resources = {
  'en-US': {
    translation: tEnUS,
  },
  'zh-CN': {
    translation: tZhCN,
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en-US',
    debug: true,
  });

export default i18n;
