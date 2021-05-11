export const forEachParallel = async <T>(list: T[], handler: (ele: T, index: number, array: T[]) => Promise<void>) => {
  let promises: any = list.map(handler);
  await Promise.all(promises);
  promises = null;
}
