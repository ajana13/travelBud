export class AppError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = "AppError";
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

export function toErrorResponse(
  err: unknown,
  cors: Record<string, string>
): Response {
  if (isAppError(err)) {
    return new Response(
      JSON.stringify({ data: null, error: { code: err.code, message: err.message } }),
      { status: err.status, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
  const message = err instanceof Error ? err.message : "Unknown error";
  return new Response(
    JSON.stringify({ data: null, error: { code: "INTERNAL_ERROR", message } }),
    { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
  );
}
