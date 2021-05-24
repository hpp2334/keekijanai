export function NotImplement() {
  return function (target: any, propKey: string) {
    target[propKey] = function () {
      throw Error(`"${propKey}" not implement!`);
    }
  }
}
