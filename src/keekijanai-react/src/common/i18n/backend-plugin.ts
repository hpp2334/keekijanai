import { BackendModule } from "i18next";

export const BackendPlugin: BackendModule = {
  type: "backend",
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {},
  read(language, namespace, callback) {
    import(`../../views/${namespace}/locales/${language}.json`)
      .then((resources) => {
        callback(null, resources);
      })
      .catch((error) => {
        callback(error, null);
      });
  },
};
