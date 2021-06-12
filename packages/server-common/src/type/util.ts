export type ClassType<Ret = any, Args extends any[] = any[]> = new (...args: Args) => Ret;
