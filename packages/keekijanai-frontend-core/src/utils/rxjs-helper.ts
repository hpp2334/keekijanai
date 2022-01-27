import { combineLatest, ObservableInput, ObservedValueOf, of, OperatorFunction, switchMap, isObservable } from "rxjs";

export const switchTap: <T>(effect: (value: T) => unknown) => OperatorFunction<T, T> = (effect) => {
  return (source) => {
    const ret = source.pipe(
      switchMap((value) => {
        const _res = effect(value);
        const res = isObservable(_res) ? _res : of(_res);

        return combineLatest([of(value), res]);
      }),
      switchMap(([x]) => {
        return of(x);
      })
    );
    return ret;
  };
};
