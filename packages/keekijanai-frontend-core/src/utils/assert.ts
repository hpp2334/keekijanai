export function assert(value: unknown, message?: string | Error): asserts value {
  if (!value) {
    const error = typeof message === "string" || message === undefined ? new Error(message) : message;
    throw error;
  }
}
