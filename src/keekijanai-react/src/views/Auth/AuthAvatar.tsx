import { useService } from "@/common/service/useService";
import { AuthService } from "@keekijanai/frontend-core";
import { Avatar, IconButton } from "@mui/material";
import { useObservableEagerState } from "observable-hooks";
import { showAuthModal } from "./AuthModal";

export const AuthAvatar = () => {
  const authService = useService(AuthService);
  const user = useObservableEagerState(authService.current$);

  return (
    <IconButton onClick={showAuthModal}>
      <Avatar src={user?.avatar_url} alt="Login"></Avatar>
    </IconButton>
  );
};
