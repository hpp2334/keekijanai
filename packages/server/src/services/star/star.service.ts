import { InjectService, Service, ServiceType } from "@/core/service";
import { authError } from "@/services/auth";

import type { AuthService } from '@/services/auth';
import type { UserService } from "@/services/user";
import { userError } from "@/services/user";
import { Star } from 'keekijanai-type';

import _ from 'lodash';

export interface StarService extends ServiceType.ServiceBase {}

@Service({
  key: 'star',
})
export class StarService {
  @InjectService('auth')    authService!: AuthService;
  @InjectService('user')    userService!: UserService;

  async post(scope: string, star: Star.StarType): Promise<Star.Get> {
    const { user } = this.authService;
    if (!user.isLogin) {
      throw authError.userNeedLogin;
    }
    
    const result = await this.provider.update({
      from: 'star',
      payload: {
        scope,
        star,
        user_id: user.id,
      },
      upsert: true,
    });
    if (result.error) {
      throw Error(result.error?.message);
    }
    return await this.get(scope);
  }

  async get(scope: string) {
    const { user } = this.authService;

    const reslist = await Promise.all([
      this.selectStar(scope, { star: 1 }),
      this.selectStar(scope, { star: 1 }),
      user.isLogin
        ? this.selectStar(scope, { 'user_id': user.id })
        : Promise.resolve({ body: { star: null } } as any)
    ]);
    const [resLike, resUnlike, resCurrent] = reslist;

    const resWithError = reslist.find(res => res.error);
    if (resWithError) {
      throw resWithError.error;
    }

    const currentStar = resCurrent.body?.[0]?.star;

    return {
      current: typeof currentStar === 'undefined' ? null : currentStar,
      total: (resLike.count || 0) - (resUnlike.count || 0)
    };
  }

  async clear(scope: string) {
    const { user } = this.authService;
    if (!user.isLogin) {
      throw authError.userNeedLogin;
    }
    const isAdmin = this.userService.matchRole(user, ['admin']);
    if (!isAdmin) {
      throw userError.userInsufficientPriority;
    }

    const result = await this.provider.delete({
      from: 'star',
      where: {
        scope: [['=', scope]]
      }
    });
    if (result.error) {
      throw result.error;
    }
  }

  private selectStar(scope: string, extraWhere: Record<string, any>) {
    return this.provider.select({
      from: 'star',
      count: 'estimated',
      where: {
        scope: [['=', scope]],
        ..._.mapValues(extraWhere, (v) => {
          return [['=', v]];
        }),
      }
    });
  }
}