import { Avatar, IconButton } from "@/components";
import { useObservableEagerState } from "observable-hooks";
import { useCallback, useRef, useState } from "react";
import { Menu, MenuItem, MenuProps } from "@/components";
import { showAuthModal } from "./AuthModal";
import { useAuthService } from "./logic";
import { useTranslation } from "@/common/i18n";
import { composeHOC, withNoSSR, withCSSBaseline } from "@/common/hoc";

export interface AuthAvatarProps {
  placement?: MenuProps["placement"];
}

const withFeature = composeHOC(withNoSSR, withCSSBaseline);

export const AuthAvatar = withFeature(({ placement }: AuthAvatarProps) => {
  const { t } = useTranslation("Auth");
  const ref = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const authService = useAuthService();
  const user = useObservableEagerState(authService.current$);

  const handleClickAvatar = useCallback(() => {
    if (authService.isLogin()) {
      setMenuOpen(true);
    } else {
      showAuthModal();
    }
  }, [authService]);

  const handleClickLogout = useCallback(() => {
    authService.logout().subscribe(() => {
      setMenuOpen(false);
    });
  }, [authService]);

  return (
    <>
      <IconButton ref={ref} onClick={handleClickAvatar}>
        <Avatar src={user?.avatar_url} alt="Login"></Avatar>
      </IconButton>
      <Menu
        open={menuOpen}
        anchorEl={menuOpen ? ref.current : null}
        onClose={() => setMenuOpen(false)}
        placement={placement ?? "bottom-end"}
      >
        <MenuItem onClick={handleClickLogout}>{t("logout")}</MenuItem>
      </Menu>
    </>
  );
});
