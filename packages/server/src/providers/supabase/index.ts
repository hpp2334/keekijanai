import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CommentServiceImpl } from './services/comment';
import { StarServiceImpl } from './services/star';
import { ViewServiceImpl } from './services/view';
import { UserServiceImpl } from './services/user';
import { Provider, ProviderFactory } from '../../core/provider';

class SupabaseFactory extends ProviderFactory<WrapperSupabase> {
  private client: SupabaseClient;
  private wrapperSupabase: WrapperSupabase;

  constructor(url: string, privateKey: string) {
    super();

    this.client = createClient(url, privateKey);
    this.wrapperSupabase = new WrapperSupabase(this.client);
  }

  factory: ProviderFactory<WrapperSupabase>['factory'] = async (ctx, config) => {
    this.wrapperSupabase.context = ctx;
    this.wrapperSupabase.config = config;
    return this.wrapperSupabase;
  }
}

class WrapperSupabase extends Provider {
  private _client: SupabaseClient;

  protected services = {
    comment: CommentServiceImpl,
    star: StarServiceImpl,
    view: ViewServiceImpl,
    user: UserServiceImpl,
  };

  get client() {
    return this._client;
  }


  constructor(client: SupabaseClient) {
    super();
    this._client = client;
  }

  
}

export {
  SupabaseFactory,
}

export type {
  WrapperSupabase as Supabase,
}
