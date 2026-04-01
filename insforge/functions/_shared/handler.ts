import { buildCorsHeaders, handlePreflight } from "./cors.ts";
import { getAuth } from "./platform/factory.ts";
import { methodNotAllowed, unauthorized } from "./response.ts";

interface HandlerContext {
  req: Request;
  user: { id: string; [key: string]: unknown } | null;
  client: unknown;
  corsHeaders: Record<string, string>;
}

interface HandlerConfig {
  methods: string[];
  requireAuth: boolean;
  handle: (ctx: HandlerContext) => Promise<Response>;
}

export function createHandler(
  config: HandlerConfig
): (req: Request) => Promise<Response> {
  const allMethods = [...config.methods, "OPTIONS"];
  const corsHeaders = buildCorsHeaders(allMethods);

  return async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
      return handlePreflight(allMethods);
    }

    if (!config.methods.includes(req.method)) {
      return methodNotAllowed(`Use ${config.methods.join(" or ")}`, corsHeaders);
    }

    if (config.requireAuth) {
      const auth = getAuth();
      const authResult = await auth.authenticateRequest(req);
      if (!authResult.authenticated) {
        return unauthorized(
          authResult.user === null && !req.headers.get("Authorization")
            ? "Missing Authorization header"
            : "Authentication required",
          corsHeaders
        );
      }
      const res = await config.handle({
        req,
        user: authResult.user,
        client: null,
        corsHeaders,
      });
      return appendHeaders(res, corsHeaders);
    }

    const res = await config.handle({
      req,
      user: null,
      client: null,
      corsHeaders,
    });
    return appendHeaders(res, corsHeaders);
  };
}

function appendHeaders(res: Response, cors: Record<string, string>): Response {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(cors)) {
    if (!headers.has(k)) {
      headers.set(k, v);
    }
  }
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}
