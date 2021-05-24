
import { serviceManager } from '@/core/service';
import { Context } from './type';

export class ContextManager {
  fromRawContext(ctx: Pick<Context, 'req' | 'res'>): Context {
    const context = {
      ...ctx,
      state: {},
      getService: function (key: string) {
        return serviceManager.instantiate(key, context);        
      }
    }
    return context;
  }
}

export const contextManager = new ContextManager();
