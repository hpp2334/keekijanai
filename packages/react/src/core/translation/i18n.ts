import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import LanguageDetector from 'i18next-browser-languagedetector';

import tEnUS from './sources/en-US.json';
import tZhCN from './sources/zh-CN.json';

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
    debug: false,
  });

export {
  i18n
}