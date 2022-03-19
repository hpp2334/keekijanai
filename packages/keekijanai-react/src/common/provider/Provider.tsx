import type React from "react";
import NiceModal from "@ebay/nice-modal-react";
import { I18nProvider } from "../i18n/provider";
import { ScopedCssBaseline } from "@/components";
import { useEffect, useLayoutEffect } from "react";
import { AuthContext } from "@/views";
import { EMPTY_LIST, once } from "../helper";
import { keekijanaiConfig } from "@keekijanai/frontend-core";

interface KeekijanaiProviderProps {
  queryRoute?: boolean;
}

const initialize = once(() => {
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

export const KeekijanaiProvider: React.FC<KeekijanaiProviderProps> = ({ queryRoute, children }) => {
  keekijanaiConfig.queryRoute = queryRoute ?? false;

  useLayoutEffect(() => {
    initialize();
  }, []);

  return (
    <ScopedCssBaseline>
      <NiceModal.Provider>
        <AuthContext>
          <I18nProvider>{children}</I18nProvider>
        </AuthContext>
      </NiceModal.Provider>
    </ScopedCssBaseline>
  );
};
