import styles from "./auth.module.scss";
import { useTranslation } from "@/common/i18n";
import { sprintf } from "sprintf-js";
import { useCallback, useEffect } from "react";
import { useInternalAuthContext } from "./Context";
import { withNoSSR, withCSSBaseline, composeHOC } from "@/common/hoc";
import { injectCSS } from "@/common/styles";
import { Button } from "@/components";
import { useGlobalService } from "../Global";
import { useSingletonTimeout } from "@/common/helper";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

export interface OAuth2CallbackRedirectProps {
  /** default: 3000 */
  timeout?: number;
}

const RedirectRoot = injectCSS("div", styles.redirectRoot);
const RedirectContainer = injectCSS("div", styles.redirectContainer);
const RedirectTitle = injectCSS("div", styles.redirectTitle);
const RedirectContent = injectCSS("div", styles.redirectContent);
const RedirectPanel = injectCSS("div", styles.redirectPanel);

const withFeature = composeHOC(withNoSSR, withCSSBaseline);

export const OAuth2CallbackRedirect = withFeature(function OAuth2CallbackRedirect({
  timeout = 3000,
}: OAuth2CallbackRedirectProps) {
  const globalService = useGlobalService();
  const timeoutHook = useSingletonTimeout();
  const { t } = useTranslation("Auth");
  const { authService } = useInternalAuthContext();

  const goToHome = useCallback(() => {
    globalService.changeLocation((current) => {
      current.pathname = "/";
      current.search = "";
      return current;
    });
  }, [globalService]);

  useEffect(() => {
    if (!globalService.valid) {
      return;
    }
    authService.handleOAuth2TokenOnUrl().subscribe(() => {
      console.debug("[OAuth2CallbackRedirect]", { timeout });
      timeoutHook.schedule(goToHome, timeout);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RedirectRoot>
      <RedirectContainer>
        <IoCheckmarkCircleOutline className={styles.icon} />
        <RedirectTitle>{t("oauth2.callback.title")}</RedirectTitle>
        <RedirectContent>{sprintf(t("oauth2.callback.content"), timeout / 1000)}</RedirectContent>
        <RedirectPanel>
          <Button onClick={goToHome}>{t("oauth2.callback.actions.go-now")}</Button>
        </RedirectPanel>
      </RedirectContainer>
    </RedirectRoot>
  );
});
