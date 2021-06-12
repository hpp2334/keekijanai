import {
  InjectService, Service, ServiceType,
  ProviderType,
  ResponseError,
} from 'keekijanai-server-core';

import type { AuthService } from '@/services/auth';
import type { UserService } from "@/services/user";
import { Star } from 'keekijanai-type';

import _ from 'lodash';

export interface StarService extends ServiceType.ServiceBase {}

const TABLE_NAME = 'keekijanai_star';
const TABLE_KEYS = ['scope', 'user_id'];

@Service({
  key: 'star',
})
export class StarService {
  @InjectService('auth')    authService!: AuthService;
  @InjectService('user')    userService!: UserService;

  async post(scope: string, star: Star.StarType): Promise<Star.Get> {
    const user = this.authService.current(true);

    const result = await this.provider.update({
      from: TABLE_NAME,
      payload: {
        scope,
        star,
        user_id: user.id,
      },
      upsert: true,
      keys: TABLE_KEYS,
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
      this.selectStar(scope, { star: -1 }),
      user.isLogin
        ? this.selectStar(scope, { 'userId': user.id })
        : Promise.resolve({ body: { star: null } } as any)
    ]);
    const [resLike, resDislike, resCurrent] = reslist;

    const resWithError = reslist.find(res => res.error);
    if (resWithError) {
      throw resWithError.error;
    }

    const currentStar = resCurrent.body?.[0]?.star;

    return {
      current: typeof currentStar === 'undefined' ? null : currentStar,
      total: (resLike.count || 0) - (resDislike.count || 0)
    };
  }

  async clear(scope: string) {
    const user = this.authService.current(true);

    const isAdmin = this.userService.matchRole(user, ['admin']);
    if (!isAdmin) {
      throw new ResponseError('not enough prviledge');
    }

    const result = await this.provider.delete({
      from: 'keekijanai_star',
      where: {
        scope: [['=', scope]]
      }
    });
    if (result.error) {
      throw result.error;
    }
  }

  private selectStar(scope: string, extraWhere: Record<string, any>) {
    const params = {
      from: 'keekijanai_star',
      count: 'estimated',
      where: {
        scope: [['=', scope]],
        ..._.mapValues(extraWhere, (v) => {
          return [['=', v]] as ProviderType.Where[string];
        }),
      } as ProviderType.Where,
      keys: TABLE_KEYS,
    };
    return this.provider.select(params);
  }
}