type CorsHeaders = Record<string, string>;

export function buildCorsHeaders(methods: string[]): CorsHeaders {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": methods.join(", "),
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export function handlePreflight(methods: string[]): Response {
  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(methods),
  });
}
