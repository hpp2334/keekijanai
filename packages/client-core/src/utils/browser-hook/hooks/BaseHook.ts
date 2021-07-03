import _ from "lodash";

type Func<ARGS extends any[], R> = (...args: ARGS) => R;

export class BaseHook<ARGS extends any[], R = void> {
  protected _hooks: Set<Func<ARGS, R>> = new Set();

  tap(hook: Func<ARGS, R>) {
    this._hooks.add(hook);
    return _.partial(this.untap.bind(this), hook);
  }

  untap(hook: Func<ARGS, R>) {
    this._hooks.delete(hook);
  }

  call(...args: ARGS) {
    throw Error('should be overwriten');
  }
}
