import React from "react";
import NiceModal from "@ebay/nice-modal-react";
import { i18n, I18nContext } from "../i18n";
import { useLayoutEffect } from "react";
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

  console.debug("[KeekijanaiProvider]", { i18n });

  useLayoutEffect(() => {
    initialize();
  }, []);

  return (
    <I18nContext instance={i18n}>
      <AuthContext>
        <NiceModal.Provider>{children}</NiceModal.Provider>
      </AuthContext>
    </I18nContext>
  );
};
