import { User, UserRole } from 'keekijanai-type';

import { Init, Service, ServiceType } from 'keekijanai-server-core';
import _ from 'lodash';
import { O } from 'ts-toolbelt';
const debug = require('debug')('keekijanai:service:user');

type INTERNAL_ROLE = 'admin' | 'normal' | 'ban';

export interface Config {
  /**
   * @example
   * roles: {
   *   [AuthUtils.getUserIDfromOAuth2('provider', 'example_user')]: ['admin']
   * }
   */
  roles?: Record<string, INTERNAL_ROLE | INTERNAL_ROLE[]>;
}

type InternalConfig = {
  roles: Record<string, number>;
};

export interface UserService extends ServiceType.ServiceBase {}

@Service({
  key: 'user',
})
export class UserService {
  private internalConfig!: InternalConfig;

  private ROLE_MAP: Record<INTERNAL_ROLE, number> = {
    'admin':   0b0000010,
    'normal':  0b0000001,
    'ban':     0b0000000,
  };

  private providers = {
    user: this.providerManager.getProvider('user', {
      table: {
        from: 'keekijanai_user',
        keys: ['id'],
      },
    }),
    userRole: this.providerManager.getProvider('user-role', {
      table: {
        from: 'keekijanai_user_role',
        keys: ['id', 'scope'],
      },
    }),
  };

  calcRole(roles: INTERNAL_ROLE | INTERNAL_ROLE[]): number {
    const role = this._calcRole(this.ROLE_MAP, roles);
    return role;
  }

  matchRole(user: User.User, roles: INTERNAL_ROLE[]): boolean {
    const calculatedRole = this.calcRole(roles) | (this.internalConfig.roles[user.id] ?? 0);
    return !!(calculatedRole & user.role);
  }

  async matchScopeRole(scope: string, roleMap: Record<string, number>, user: User.User, roles: string | string[], useInternal?: INTERNAL_ROLE | INTERNAL_ROLE[]) {
    let targetRole = this._calcRole(roleMap, roles);

    const result = await this.providers.userRole.select<UserRole>({
      columns: ['*'],
      where: {
        id: [['=', user.id]],
        scope: [['=', scope]],
      },
    });
    if (result.error) {
      throw Error(`get user role with scope "${scope}" fail.`);
    }
    if (Array.isArray(result.body) && result.body.length === 1) {
      const [scopeRole] = result.body;
      const matched = !!(targetRole & scopeRole);
      if (matched) {
        return true;
      }
    }
    if (useInternal !== undefined) {
      return this.matchRole(user, typeof useInternal === 'string' ? [useInternal] : useInternal);
    }
    return false;
  }

  async updateScopeRole(scope: string, roleMap: Record<string, number>, user: User.User, roles: string | string[]) {
    let targetRole = this._calcRole(roleMap, roles);

    const result = this.providers.userRole.update({
      where: {
        id: [['=', user.id]],
        scope: [['=', scope]],
      },
      payload: {
        role: targetRole,
      }
    });
    if (result.error || result.body?.length !== 1) {
      throw Error(`update user role with scope "${scope}" to ${roles} fail.`);
    }
    return result.body?.[0];
  }

  async insert(payload: User.User): Promise<User.User> {
    const result = await this.providers.user.insert({
      payload,
    });
    const inserted = result.body?.[0];
    if (result.error || !inserted) {
      throw Error(`insert user "${payload.id}" fail. ` + result.error?.message);
    }
    
    debug('upsert success, params=%j', inserted);
    return inserted;
  }

  async upsert(params: { id: string; } & Partial<User.User>): Promise<User.User> {
    const result = await this.providers.user.update({
      payload: params,
      upsert: true,
    });
    
    const payload = result.body?.[0];
    if (result.error || !payload) {
      throw Error(`upsert user "${params.id}" fail. ` + result.error?.message);
    }
    
    debug('upsert success, params=%j', payload);
    return payload;
  }

  async get <SE extends boolean = false>(id: string, opts?: {
    includePassword?: boolean,
    shouldExists?: SE,
  }): Promise<SE extends false ? User.User | undefined : User.User> {
    const result = await this.providers.user.select({
        columns: ['*'],
        where: {
          id: [['=', id]]
        },
      });
    if ((result.body?.length ?? 0) > 1) {
      throw Error(`get user result length more than 1, where id="${id}"`);
    }
    if (opts?.shouldExists && (result.body?.length ?? 0) === 0) {
      throw Error(`user "${id}" not exists`);
    }
  
    const payload = result.body?.[0];
    if (payload) {
      payload.role = payload.role | (this.internalConfig.roles[payload.id] ?? 0);

      if (!opts?.includePassword) {
        delete payload.password;
      }
    }
    
    debug('get user success, payload=%j', payload);
    return payload;
  }

  async delete(id: number) {
    const result = await this.providers.user.delete({
      where: {
        id: [['=', id]]
      }
    });

    if (result.error) {
      throw result.error;
    }
  }

  async TEST__delete() {
    await this.providers.user.delete({ });
  }

  private _calcRole(roleMap: Record<string, number>, roles: string | string[]): number {
    return (typeof roles === 'string' ? [roles] : roles).reduce(
      (prev, roleStr) => {
        if (!(roleStr in roleMap)) {
          throw Error(`role "${roleStr}" not in roleMap`);
        }
        return prev | roleMap[roleStr];
      },
      0
    );
  }

  @Init('config')
  setInternalConfig(config: Config) {
    let roles: InternalConfig['roles'] = {};
    if (config?.roles) {
      if (!_.isObjectLike(config.roles)) {
        throw Error('"roles" should be an object when configured.');
      }

      for (const userID in config.roles) {
        roles[userID] = this.calcRole(config.roles[userID]);
      }
    }

    this.internalConfig = {
      roles,
    };
  }
}