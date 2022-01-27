import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { BackendPlugin } from "./backend-plugin";

// export const i18nInstance = i18next
//   .use(LanguageDetector)
//   .use(BackendPlugin)
//   .use(initReactI18next)
//   .createInstance(
//     {
//       debug: true,
//       fallbackLng: "en",
//       interpolation: {
//         escapeValue: false,
//       },
//     },
//     function (err) {
//       if (err) {
//         console.error(err);
//       }
//     }
//   );
i18next
  .use(BackendPlugin)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(
    {
      debug: true,
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    },
    function (err) {
      if (err) {
        console.error(err);
      }
    }
  );

export const i18nInstance = i18next;
