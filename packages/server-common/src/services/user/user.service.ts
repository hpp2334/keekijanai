import { User } from 'keekijanai-type';

import { Init, Service, ServiceType } from 'keekijanai-server-core';
import _ from 'lodash';
import { O } from 'ts-toolbelt';
const debug = require('debug')('keekijanai:service:user');

export interface Config {
  /**
   * @example
   * roles: {
   *   [AuthUtils.getUserIDfromOAuth2('provider', 'example_user')]: ['admin']
   * }
   */
  roles?: Record<string, string | string[]>;
}

type InternalConfig = {
  roles: Record<string, number>;
};

export interface UserService extends ServiceType.ServiceBase {}

const TABLE_NAME = 'keekijanai_user';
const TABLE_KEYS = ['id'];

@Service({
  key: 'user',
})
export class UserService {
  private internalConfig!: InternalConfig;

  private ROLE_MAP: Record<string, number | undefined> = {
    'admin':   0b0000010,
    'normal':  0b0000001,
    'ban':     0b0000000,
  };

  calcRole(roles: string | string[]) {
    const role = (typeof roles === 'string' ? [roles] : roles).reduce((prev, curr) => (this.ROLE_MAP[curr] ?? 0) | prev, 0);
    return role;
  }

  matchRole(user: User.User, roles: string[]) {
    const calculatedRole = this.calcRole(roles) | (this.internalConfig.roles[user.id] ?? 0);
    return !!(calculatedRole & user.role);
  }

  async insert(payload: User.User): Promise<User.User> {
    const result = await this.provider.insert({
      from: TABLE_NAME,
      payload,
      keys: TABLE_KEYS,
    });
    const inserted = result.body?.[0];
    if (result.error || !inserted) {
      throw Error(`insert user "${payload.id}" fail. ` + result.error?.message);
    }
    
    debug('upsert success, params=%j', inserted);
    return inserted;
  }

  async upsert(params: { id: string; } & Partial<User.User>): Promise<User.User> {
    const result = await this.provider.update({
      from: TABLE_NAME,
      payload: params,
      upsert: true,
      keys: TABLE_KEYS,
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
    const result = await this.provider.select({
        from: TABLE_NAME,
        columns: ['*'],
        where: {
          id: [['=', id]]
        },
        keys: TABLE_KEYS,
      });
    if ((result.body?.length ?? 0) > 1) {
      throw Error(`get user result length more than 1, where id="${id}"`);
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
    const result = await this.provider.delete({
      from: 'keekijanai_user',
      where: {
        id: [['=', id]]
      }
    });

    if (result.error) {
      throw result.error;
    }
  }

  async TEST__delete() {
    await this.provider.delete({
      from: 'keekijanai_user',
    });
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