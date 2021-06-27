
type Func<ARGS extends any[], R> = (...args: ARGS) => R;

export class BaseHook<ARGS extends any[], R = void> {
  protected _hooks: Array<Func<ARGS, R>> = [];

  tap(hook: Func<ARGS, R>) {
    this._hooks.push(hook);
  }

  call(...args: ARGS) {
    throw Error('should be overwriten');
  }
}
