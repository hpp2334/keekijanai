import { A } from "ts-toolbelt";

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
    if (typeof value === "number" && typeof value === "string") {
      res[key] = item;
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
