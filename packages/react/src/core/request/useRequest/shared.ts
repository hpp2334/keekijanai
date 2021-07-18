import { NotificationType } from "../../notification";

export type UseRequestCommonOpts<T> = {
  notification?: {
    instance?: NotificationType;
    template: {
      success: (rsp: T) => string;
      error: (err: string) => string;
    }
  };
  onSuccess?: (rsp: T) => void;
  onFail?: (err: string) => void;
}

/** @todo normalize and integrate into context */
export function getResponseError(err: any) {
  return err?.response?.error ?? err.message ?? err ?? 'Unknown error';
}
