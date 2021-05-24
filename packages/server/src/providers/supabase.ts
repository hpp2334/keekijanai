import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Provider } from '@/core/provider';

@Provider({
  key: 'supabase',
  transformCamel: true,
})
class SupabaseProvider {
  private _client: SupabaseClient;

  constructor(...args: any[]) {
    const [url, privateKey] = args;
    this._client = createClient(url, privateKey);
  }
}

export {
  SupabaseProvider as Supabase,
}
