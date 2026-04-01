import { getAuth } from "./platform/factory.ts";

export interface AuthResult {
  authenticated: boolean;
  user: { id: string; [key: string]: unknown } | null;
  client: unknown | null;
  error: "UNAUTHORIZED" | null;
}

export async function authenticateRequest(req: Request): Promise<AuthResult> {
  const auth = getAuth();
  const result = await auth.authenticateRequest(req);

  return {
    authenticated: result.authenticated,
    user: result.user,
    client: null,
    error: result.authenticated ? null : "UNAUTHORIZED",
  };
}
