import { buildCorsHeaders, handlePreflight } from "./cors.ts";
import { authenticateRequest } from "./auth.ts";
import { methodNotAllowed, unauthorized } from "./response.ts";
import { setEdgeFunctionToken } from "./db.ts";

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
      const authResult = await authenticateRequest(req);
      if (!authResult.authenticated) {
        return unauthorized(
          authResult.user === null && !req.headers.get("Authorization")
            ? "Missing Authorization header"
            : "Authentication required",
          corsHeaders
        );
      }
      const authHeader = req.headers.get("Authorization");
      const token = authHeader ? authHeader.replace("Bearer ", "") : null;
      setEdgeFunctionToken(token);
      try {
        const res = await config.handle({
          req,
          user: authResult.user,
          client: authResult.client,
          corsHeaders,
        });
        return appendHeaders(res, corsHeaders);
      } finally {
        setEdgeFunctionToken(null);
      }
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
