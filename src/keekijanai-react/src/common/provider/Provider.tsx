import type React from "react";
import NiceModal from "@ebay/nice-modal-react";
import { I18nProvider } from "../i18n/provider";
import { ScopedCssBaseline } from "@/components";
import _ from "lodash-es";
import { useEffect, useLayoutEffect } from "react";
import { AuthProvider } from "@/views";
import { EMPTY_LIST } from "../helper";

const initialize = _.once(() => {
  if (typeof document !== "undefined" && typeof window !== "undefined") {
    const createRobotFontLinkEl = () => {
      const el = document.createElement("link");
      el.rel = "stylesheet";
      el.href = "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap";
      return el;
    };

    const robotFontLinkEl = createRobotFontLinkEl();
    document.head.append(robotFontLinkEl);
  }
});

export const KeekijanaiProvider: React.FC<{}> = ({ children }) => {
  useLayoutEffect(() => {
    initialize();
  }, []);

  return (
    <ScopedCssBaseline>
      <NiceModal.Provider>
        <AuthProvider args={EMPTY_LIST}>
          <I18nProvider>{children}</I18nProvider>
        </AuthProvider>
      </NiceModal.Provider>
    </ScopedCssBaseline>
  );
};
