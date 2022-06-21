import { A, T } from "ts-toolbelt";
import { makeArrayIterator, makeArrayReverseIterator } from "./iterator";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const isNil = (x: unknown): x is null | undefined => x === null || x === undefined;

export const noop = (..._args: any[]) => undefined as any;

export const shouldOverride =
  (msg: string) =>
  (..._args: unknown[]) => {
    throw new Error(`${msg} should be overrided`);
  };

export const keyBy = <T, P extends keyof T>(list: T[], key: P): Record<string, T> => {
  const res = {} as any;
  for (const item of list) {
    const value = item[key];
    if (typeof value === "number" || typeof value === "string") {
      res[value] = item;
    }
  }
  return res;
};

export const omit = <T extends Record<string, any>, P extends keyof T>(record: T, omitKeys: P[]): Omit<T, P> => {
  const omitKeysSet = new Set(omitKeys);
  const res = {} as any;
  for (const key in record) {
    if (!omitKeysSet.has(key as any)) {
      res[key] = record[key];
    }
  }
  return res;
};

export const isObjectLike = (x: unknown): x is Record<string, any> => x !== null && typeof x === "object";

export function partial<A extends any[], B extends any[], R>(
  fn: (...args: [...A, ...B]) => R,
  ...args: A
): (...leftArgs: B) => R;
export function partial(fn: (...args: any[]) => any, ...args: any[]) {
  const partialFn = fn.bind(null, ...args);
  return partialFn;
}

export const switchAllCaseCheck = (x: never) => undefined as void;

interface FindContain<T> {
  list: T[];
  hash: (x: T) => string | number;
}
/** @returns first index in `a` */
const findContainIndex = <T, U>(a: FindContain<T>, b: FindContain<U>, findLast = false): number | undefined => {
  const aMap = new Map<string | number, number>();
  for (let i = 0; i < a.list.length; i++) {
    aMap.set(a.hash(a.list[i]), i);
  }

  let iter = !findLast ? makeArrayIterator(b.list) : makeArrayReverseIterator(b.list);
  while (iter) {
    const iterHash = b.hash(iter.value());
    if (aMap.has(iterHash)) {
      return aMap.get(iterHash);
    }
    iter = iter.next();
  }
  return undefined;
};
/** @returns first index in `a` */
export const findFirstContainIndex = <T, U>(a: FindContain<T>, b: FindContain<U>): number | undefined => {
  return findContainIndex(a, b);
};
/** @returns first index in `a` */
export const findLastContainIndex = <T, U>(a: FindContain<T>, b: FindContain<U>): number | undefined => {
  return findContainIndex(a, b, true);
};
