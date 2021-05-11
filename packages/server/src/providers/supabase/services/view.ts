import { ViewService } from "../../../type";
import type { Supabase } from '..'
import { Service } from "../../../core/service";

export class ViewServiceImpl extends Service<Supabase> implements ViewService {
  get: ViewService['get'] = async (scope) => {
    const { clientID } = this.context;

    const result = await this.provider.client.from('view')
      .upsert(
        [
          { scope, 'client_id': clientID },
        ],
        { returning: 'minimal' }
      );
    if (result.error) {
      throw result.error;
    }

    const rsp = await this.provider.client.from('view').select('*', { count: 'exact' }).eq('scope', scope);
    return { view: rsp.count || 0 };
  }
}
