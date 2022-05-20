declare global {
  interface Array<T> {
    asyncForeach: (this: Array<T>, fn: (item: T, index: number) => Promise<void>) => Promise<void>;
  }
}

Array.prototype.asyncForeach = async function (fn) {
  await Promise.all(this.map(fn));
};

export default {};
