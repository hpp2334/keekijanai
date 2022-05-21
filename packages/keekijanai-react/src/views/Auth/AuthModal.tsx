import { Modal, Typography, Stack } from "@/components";
import { useTranslation } from "@/common/i18n";
import React, { useEffect, useMemo } from "react";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { sprintf } from "sprintf-js";
import { GoMarkGithub } from "react-icons/go";
import { OAuth2 } from "@keekijanai/frontend-core";
import { useInternalAuthContext } from "./Context";
import { injectCSS } from "@/common/styles";

import styles from "./auth.module.scss";

const OAuth2Button = injectCSS("button", styles.oauth2Button);
const AuthModalTitle = injectCSS("div", styles.modalTitle);
const ModalContent = injectCSS("div", styles.modalContent);

interface AuthModalProps {
  [key: string]: unknown;
}

const AuthModalContent = () => {
  const { t } = useTranslation("Auth");
  const { authService } = useInternalAuthContext();

  const githubElRef = useMemo(() => authService.createOAuth2LoginRef(OAuth2.Provider.Github), [authService]);

  useEffect(() => {
    githubElRef.apply();
  }, [githubElRef]);

  return (
    <ModalContent>
      <Stack direction="column" spacing={2}>
        <AuthModalTitle>{t("modal.title")}</AuthModalTitle>
        <OAuth2Button ref={githubElRef.ref}>
          <Stack direction="row" spacing={1} alignItems="center">
            <GoMarkGithub fontSize={24} />
            <Typography>{sprintf(t("oauth2.auth-with"), "Github")}</Typography>
          </Stack>
        </OAuth2Button>
      </Stack>
    </ModalContent>
  );
};

export const AuthModal = NiceModal.create<AuthModalProps>(() => {
  const modal = useModal();

  return (
    <Modal open={modal.visible} onClose={() => modal.hide()}>
      <div className={styles.authModalRoot}>
        <AuthModalContent />
      </div>
    </Modal>
  );
});

export const showAuthModal = () => {
  NiceModal.show(AuthModal);
};

export const hideAuthModal = () => {
  NiceModal.hide(AuthModal);
};
