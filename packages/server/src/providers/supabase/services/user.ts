
import type { Supabase } from '..'
import { Core, UserService } from '../../../type';
import { convert } from '../../../utils/db';

import createDebugger from 'debug';
import { Service } from '../../../core/service';
const debug = createDebugger('keekijanai:provider:supabase:user');

export class UserServiceImpl extends Service<Supabase> implements UserService {
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
}