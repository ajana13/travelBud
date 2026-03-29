type CorsRecord = Record<string, string>;

function envelope(data: unknown, error: unknown): string {
  return JSON.stringify({ data: data ?? null, error: error ?? null });
}

function jsonHeaders(cors: CorsRecord): CorsRecord {
  return { ...cors, "Content-Type": "application/json" };
}

export function jsonOk(data: unknown, cors: CorsRecord, status = 200): Response {
  return new Response(envelope(data, null), {
    status,
    headers: jsonHeaders(cors),
  });
}

export function jsonError(
  code: string,
  message: string,
  cors: CorsRecord,
  status: number
): Response {
  return new Response(envelope(null, { code, message }), {
    status,
    headers: jsonHeaders(cors),
  });
}

export function methodNotAllowed(message: string, cors: CorsRecord): Response {
  return jsonError("METHOD_NOT_ALLOWED", message, cors, 405);
}

export function unauthorized(message: string, cors: CorsRecord): Response {
  return jsonError("UNAUTHORIZED", message, cors, 401);
}

export function notImplemented(message: string, cors: CorsRecord): Response {
  return jsonError("NOT_IMPLEMENTED", message, cors, 501);
}
