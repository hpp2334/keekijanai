
import type { Supabase } from '..'
import { Core, UserService } from '../../../type';
import { convert } from '../../../utils/db';

import createDebugger from 'debug';
import { Service } from '../../../core/service';
import _ from 'lodash';
const debug = createDebugger('keekijanai:provider:supabase:user');

interface Config {
  roles: Record<string, number>;
}

export class UserServiceImpl extends Service<Supabase> implements UserService {
  private internalConfig!: Config;

  private ROLE_MAP: Record<string, number | undefined> = {
    'admin':   0b0000010,
    'normal':  0b0000001,
    'ban':     0b0000000,
  };

  constructor(...args: ConstructorParameters<Core.ServiceConstructor<Supabase>>) {
    super(...args);

    this.setInternalConfig(this.provider?.config?.services?.user);
  }

  matchRole: UserService['matchRole'] = (user, roles) => {
    const calculatedRole = this.calcRole(roles) | (this.internalConfig.roles[user.id] ?? 0);
    return !!(calculatedRole & user.role);
  }

  upsert: UserService['upsert'] = async (params) => {
    const result = await this.provider.client
      .from('keekijanai_user')
      .upsert(convert(params, 'to-db'))
    
    const payload = result.body?.[0];
    if (result.error || !payload) {
      debug('upsert error, payload=%o', payload);
      throw Error(`upsert user "${params.id}" fail.` + result.error?.message);
    }
    
    debug('upsert success, params=%j', payload);
    return convert(payload, 'from-db');
  }

  get: UserService['get'] = async (id, opts) => {
    const result = await this.provider.client
      .from('keekijanai_user')
      .select('*')
      .eq('id', id)
      .single();
  
    const payload = result.body;
    if (result.error || !payload) {
      debug('get error, %s', result.error);
      throw Error(`get user "${id}" fail`);
    }

    if (!opts?.includePassword) {
      delete result.body.password;
    }
    
    debug('get user success, payload=%j', payload);
    return convert(payload, 'from-db');
  }

  delete: UserService['delete'] = async (id) => {
    const result = await this.provider.client
      .from('keekijanai_user')
      .delete()
      .match({ id });

    if (result.error) {
      throw result.error;
    }
  }

  private calcRole(roles: string | string[]) {
    const role = (typeof roles === 'string' ? [roles] : roles).reduce((prev, curr) => (this.ROLE_MAP[curr] ?? 0) | prev, 0);
    return role;
  }

  private setInternalConfig(config: any) {
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