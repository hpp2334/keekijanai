export class ResponseError extends Error {
  constructor(message?: string | undefined, public code: number = 400) {
    super(message);
  }
}
