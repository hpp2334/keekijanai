import { Auth, Core } from ".";
import { Manager } from "../core/manager";
import { ServerlessContext } from "../_framework";
import { UserService, ViewService, AuthService, StarService, CommentService, NotifyService } from "./services";

type F<K extends string, V extends Core.Service> = Core.GetServiceBase<K, V>
export type GetServiceWithHint =
  F<'view', ViewService> &
  F<'user', UserService> &
  F<'auth', AuthService> &
  F<'star', StarService> &
  F<'comment', CommentService> &
  F<'notify', NotifyService> &
  F<string, Core.UnknownService>;

export interface ContextState {
  // client: Provider;
  clientID: string; // indicate unique client, such as browser, ...
  user: Auth.CurrentUser;

  manager: Manager;
  getService: GetServiceWithHint;
}

export type Context = ServerlessContext<ContextState>;