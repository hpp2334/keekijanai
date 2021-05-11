import { Core } from '..';
import { Comment, Auth, Star, User, View, Grouping } from 'keekijanai-type';

export interface StarService extends Core.Service {
  post(scope: string, star: number | null): Promise<Star.Get>;
  get(scope: string): Promise<Star.Get>;
  clear(scope: string): Promise<void>;
}

export interface CommentService extends Core.Service {
  create(scope: string, comment: Comment.Create): Promise<Comment.Get>;
  list(scope: string, parentId: number | undefined, grouping: Grouping): Promise<Comment.List>;
  delete(scope: string, commentId: Comment.Get['id']): Promise<Comment.Delete>;
}

export interface ViewService extends Core.Service {
  get(scope: string): Promise<View.Get>;
}

export interface AuthService extends Core.Service {
  auth(type: 'legacy', username: string, password: string): Promise<any>;
  auth(type: 'oauth2', provider: string): Promise<string>;
  getCurrentUser(jwt?: string): Promise<Auth.CurrentUser>;
  oauth2GetCode(provider: string): Promise<string>;
  oauth2GetAccessToken(provider: string, code: string): Promise<string>;
}

export interface NotifyService extends Core.Service {
  notify(msg: string): Promise<any>;
  shouldNotify(): boolean;
}

export interface UserService extends Core.Service {
  upsert(params: {
    id: string;
    password?: string;
    provider?: string;
    lastLogin?: number;
    avatarUrl?: string;
    email?: string;
  }): Promise<User.User>;

  get(id: string, opts?: {
    includePassword?: boolean,
  }): Promise<User.User>;

  delete(id: string): Promise<void>;
}

export interface TimeService extends Core.Service {
  getTime(): Promise<number>;
}