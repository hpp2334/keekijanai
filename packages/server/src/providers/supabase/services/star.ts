
import type { Supabase } from '..'
import { Service } from '../../../core/service';
import { StarService } from '../../../type';
import { commonError } from '../../../rsp-error';

export class StarServiceImpl extends Service<Supabase> implements StarService {
  post: StarService['post'] = async (scope, star) => {
    const { user } = this.context;
    if (!user.isLogin) {
      throw commonError.auth.userNeedLogin();
    }
    
    const result = await this.provider.client
      .from('star')
      .upsert({
        scope,
        star,
        user_id: user.id,
      })
      .single();
    return await this.get(scope);
  }

  get: StarService['get'] = async (scope) => {
    const { user } = this.context;
    const client = this.provider.client;

    const reslist = await Promise.all([
      client.from('star').select('*', { count: 'estimated' }).eq('scope', scope).eq('star', 1),
      client.from('star').select('*', { count: 'estimated' }).eq('scope', scope).eq('star', -1),
      user.isLogin
        ? client.from('star')
          .select('*')
          .eq('scope', scope)
          .eq('user_id', user.id)
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

  /** @todo limit role to admin */
  clear: StarService['clear'] = async (scope) => {
    const { user } = this.context;
    if (!user.isLogin) {
      throw commonError.auth.userNeedLogin();
    }

    const result = await this.provider.client.from('star').delete().match({ scope });
    if (result.error) {
      throw result.error;
    }
  }
}