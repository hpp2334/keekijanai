export interface EntireRequest {
  uri: string;
  headers: Array<[string, string]>;
  body: string;
}

export interface EntireResponse {
  statusCode: number;
  headers: Array<[string, string]>;
  body: string;
}

export function processEntireRequest(req: EntireRequest): EntireResponse;
