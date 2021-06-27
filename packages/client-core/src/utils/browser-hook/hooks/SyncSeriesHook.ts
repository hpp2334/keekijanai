import { BaseHook } from './BaseHook';

export class SyncSeriesHook<ARGS extends any[], R = void> extends BaseHook<ARGS, R> {
  call(...args: ARGS): R | null {
    let ret = null as any as R | null;
    for (const hook of this._hooks) {
      ret = hook(...args);
    }
    return ret;
  }
}
