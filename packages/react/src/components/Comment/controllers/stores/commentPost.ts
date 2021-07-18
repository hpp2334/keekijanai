
export interface State {
  parentId: number | undefined;
  referenceId: number | undefined;
  placeholder?: string;
}

export type ActionSet = { type: 'set'; payload: Partial<State> };
export type ActionReset = { type: 'reset' };
export type Action = ActionSet | ActionReset;

export const initState: State = {
  parentId: undefined,
  referenceId: undefined,
  placeholder: undefined,
};

export const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'set':
      return { ...state, ...action.payload };
    case 'reset':
      return initState;
    default:
      return initState;
  }
}
