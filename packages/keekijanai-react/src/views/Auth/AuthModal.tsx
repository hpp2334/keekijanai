import { Modal, ButtonUnstyled, styled, Typography, Stack, ButtonUnstyledProps } from "@/components";
import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo } from "react";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { sprintf } from "sprintf-js";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useService } from "@/common/service/useService";
import { AuthService, OAuth2 } from "@keekijanai/frontend-core";

const OAuth2ButtonRoot = styled("button")(({ theme }) => ({
  cursor: "pointer",
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.grey[300]}`,
  borderRadius: 4,
  transition: "border-color 0.2s",
  "&:hover:enabled": {
    borderColor: theme.palette.primary.main,
  },
  "&:disabled": {
    cursor: "not-allowed",
  },
}));

const AuthModalTitle = styled(Typography)(({ theme }) => ({
  margin: `${theme.spacing(1)} 0`,
  fontSize: theme.typography.h5.fontSize,
  display: "flex",
  justifyContent: "center",
}));

const ModalContent = styled("div")(({ theme }) => ({
  width: 400,
  padding: theme.spacing(4),
  background: theme.palette.background.paper,
  position: "absolute" as const,
  top: "40%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  borderRadius: 4,
}));

const OAuth2Button = React.forwardRef<HTMLButtonElement, ButtonUnstyledProps>(function OAuth2Button(props, ref) {
  return <ButtonUnstyled ref={ref} {...props} component={OAuth2ButtonRoot} />;
});

interface AuthModalProps {
  [key: string]: unknown;
}

const AuthModalContent = () => {
  const { t } = useTranslation("Auth");
  const authService = useService(AuthService);

  const githubElRef = useMemo(() => authService.createOAuth2LoginRef(OAuth2.Provider.Github), [authService]);

  useEffect(() => {
    githubElRef.apply();
  }, [githubElRef]);

  return (
    <ModalContent>
      <Stack direction="column" spacing={2}>
        <AuthModalTitle>{t("modal.title")}</AuthModalTitle>
        <OAuth2Button ref={githubElRef.ref}>
          <Stack direction="row" spacing={1}>
            <GitHubIcon />
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
      <AuthModalContent />
    </Modal>
  );
});

export const showAuthModal = () => {
  NiceModal.show(AuthModal);
};

export const hideAuthModal = () => {
  NiceModal.hide(AuthModal);
};