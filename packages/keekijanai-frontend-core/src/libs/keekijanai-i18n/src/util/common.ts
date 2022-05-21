export const isPromise = (x: unknown): x is Promise<any> => !!x && typeof x === "object" && "then" in x;
