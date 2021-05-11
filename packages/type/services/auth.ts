import { User } from "./user";


export interface LoginedCurrentUser extends User {
  isLogin: true;
}

export interface NotLoginedCurrentUser {
  isLogin: false;
}

export type CurrentUser = (LoginedCurrentUser | NotLoginedCurrentUser);

