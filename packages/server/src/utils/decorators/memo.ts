
function memoFunc(context: any, handler: Function) {
  const map = new Map<string, any>();
  return function (...args: any[]) {
    if (args.length === 0) {
      handler.apply(context);
    } else {
      const argStr = args.reduce((prev, s) => prev + s + '_$#', '');
      if (map.has(argStr)) {
        return map.get(argStr);
      } else {
        const result = handler.apply(context, args);
        map.set(argStr, result);
        return result;
      }
    }
  }
}

export function Memo() {
  return function (target: any, propKey: string) {
    const handler = target[propKey];
    target[propKey] = memoFunc(target, handler);
  }
}
