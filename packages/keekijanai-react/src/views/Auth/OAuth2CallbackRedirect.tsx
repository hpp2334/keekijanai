import { useTranslation } from "@/common/i18n";
import { sprintf } from "sprintf-js";
import { useEffect } from "react";
import { useInternalAuthContext } from "./Context";

export interface OAuth2CallbackRedirectProps {
  /** default: 3000 */
  timeout?: number;
}

export const OAuth2CallbackRedirect = ({ timeout = 3000 }: OAuth2CallbackRedirectProps) => {
  const { t } = useTranslation("Auth");
  const { authService } = useInternalAuthContext();

  useEffect(() => {
    if (typeof window !== "undefined") {
      authService.handleOAuth2TokenOnUrl().subscribe(() => {
        console.debug("[OAuth2CallbackRedirect]", { timeout });
        setTimeout(() => {
          const next = new URL(window.location.href);
          next.pathname = "/";
          next.search = "";
          window.location.href = next.href;
        }, timeout);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>{sprintf(t("oauth2.callback"), timeout / 1000)}</div>;
};
