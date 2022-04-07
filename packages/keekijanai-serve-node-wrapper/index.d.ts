export interface EntireRequest {
  uri: string;
  method: string;
  headers: Array<[string, string]>;
  body: string | null;
}

export interface EntireResponse {
  statusCode: number;
  headers: Array<[string, string]>;
  body: string;
}

export function processEntireRequest(req: EntireRequest): EntireResponse;
