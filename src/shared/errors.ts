export class AppError extends Error {
  constructor(public statusCode: number, message: string) { super(message); }
}

export function assertFound<T>(value: T | undefined, message = 'Not found'): T {
  if (!value) throw new AppError(404, message);
  return value;
}
