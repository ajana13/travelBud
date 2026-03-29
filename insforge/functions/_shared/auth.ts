import { createClient } from "npm:@insforge/sdk";

export interface AuthResult {
  authenticated: boolean;
  user: { id: string; [key: string]: unknown } | null;
  client: ReturnType<typeof createClient> | null;
  error: "UNAUTHORIZED" | null;
}

export async function authenticateRequest(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader ? authHeader.replace("Bearer ", "") : null;

  if (!token) {
    return { authenticated: false, user: null, client: null, error: "UNAUTHORIZED" };
  }

  const client = createClient({
    baseUrl: Deno.env.get("INSFORGE_BASE_URL"),
    anonKey: Deno.env.get("ANON_KEY"),
    isServerMode: true,
    edgeFunctionToken: token,
  });

  const { data: userData } = await client.auth.getCurrentUser();
  if (!userData?.user?.id) {
    return { authenticated: false, user: null, client: null, error: "UNAUTHORIZED" };
  }

  return { authenticated: true, user: userData.user, client, error: null };
}
