import { User } from 'keekijanai-type';

import { Init, Service, ServiceType } from '@/core/service';
import _ from 'lodash';
const debug = require('debug')('keekijanai:service:user');

interface Config {
  roles: Record<string, number>;
}

export interface UserService extends ServiceType.ServiceBase {}

@Service({
  key: 'user',
})
export class UserService {
  private internalConfig!: Config;

  private ROLE_MAP: Record<string, number | undefined> = {
    'admin':   0b0000010,
    'normal':  0b0000001,
    'ban':     0b0000000,
  };

  matchRole(user: User.User, roles: string[]) {
    const calculatedRole = this.calcRole(roles) | (this.internalConfig.roles[user.id] ?? 0);
    return !!(calculatedRole & user.role);
  }

  async upsert(params: {
    id: string;
    password?: string;
    provider?: string;
    lastLogin?: number;
    avatarUrl?: string;
    email?: string;
    role?: number;
  }): Promise<User.User> {
    const result = await this.provider.update({
      from: 'keekijanai_user',
      payload: params,
      upsert: true,
    });
    
    const payload = result.body?.[0];
    if (result.error || !payload) {
      debug('upsert error, payload=%o', payload);
      throw Error(`upsert user "${params.id}" fail.` + result.error?.message);
    }
    
    debug('upsert success, params=%j', payload);
    return payload;
  }

  async get(id: string, opts?: {
    includePassword?: boolean,
  }): Promise<User.User> {
    const result = await this.provider.select({
        from: 'keekijanai_user',
        columns: ['*'],
        where: {
          id: [['=', id]]
        }
      });
    if (result.body?.length !== 1) {
      throw Error(`get user fail where id="${id}`);
    }
  
    const payload = result.body[0];

    if (!opts?.includePassword) {
      delete payload.password;
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

  private calcRole(roles: string | string[]) {
    const role = (typeof roles === 'string' ? [roles] : roles).reduce((prev, curr) => (this.ROLE_MAP[curr] ?? 0) | prev, 0);
    return role;
  }

  @Init('config')
  setInternalConfig(config: any) {
    let roles: Exclude<Config['roles'], undefined> = {};
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