export function notImplmentation(prefix: string) {
  const handler: ((...args: any[]) => any) = () => {
    throw Error(`${prefix} not implement!`);
  };
  return handler;
}

