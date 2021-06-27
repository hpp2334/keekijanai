import { BaseHook } from './BaseHook';

export class AsyncSeriesHook<ARGS extends any[], R = void> extends BaseHook<ARGS, Promise<R>> {
  async call(...args: ARGS): Promise<R | null> {
    let ret = null as any as R | null;
    for (const hook of this._hooks) {
      ret = await hook(...args);
    }
    return ret;
  }
}
