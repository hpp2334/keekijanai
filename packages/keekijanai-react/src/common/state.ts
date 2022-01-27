// TODO
type KeekijanaiError = any;

export const enum StateType {
  Pending,
  Loading,
  Loaded,
  Failed,
}

interface Pending {
  type: StateType.Pending;
  data: null;
  err: null;
}

interface Loading {
  type: StateType.Loading;
  data: null;
  err: null;
}

interface Loaded<T> {
  type: StateType.Loaded;
  data: T;
  err: null;
}

interface Failed {
  type: StateType.Failed;
  data: null;
  err: KeekijanaiError;
}

export type State<T> = Pending | Loading | Loaded<T> | Failed;
