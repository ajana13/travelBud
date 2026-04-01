import { createClient } from "npm:@insforge/sdk";
import type { DatabasePort, AuthPort, AuthResult, RuntimePort } from "./ports.ts";

// ─── Runtime ────────────────────────────────────────────────────────────────

export function createInsForgeRuntime(): RuntimePort {
  return {
    getEnv(key: string): string | undefined {
      return Deno.env.get(key);
    },
  };
}

// ─── Database ───────────────────────────────────────────────────────────────

export function createInsForgeDatabase(runtime: RuntimePort): DatabasePort {
  return {
    from(table: string) {
      const internalUrl = runtime.getEnv("INSFORGE_INTERNAL_URL");
      const apiKey = runtime.getEnv("API_KEY");
      const client = createClient({
        baseUrl: internalUrl || runtime.getEnv("INSFORGE_BASE_URL"),
        anonKey: apiKey || runtime.getEnv("ANON_KEY"),
      });
      return client.database.from(table);
    },
  };
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export function createInsForgeAuth(runtime: RuntimePort): AuthPort {
  return {
    async authenticateRequest(req: Request): Promise<AuthResult> {
      const authHeader = req.headers.get("Authorization");
      const token = authHeader ? authHeader.replace("Bearer ", "") : null;

      if (!token) {
        return { authenticated: false, user: null, error: "UNAUTHORIZED" };
      }

      const client = createClient({
        baseUrl: runtime.getEnv("INSFORGE_BASE_URL"),
        anonKey: runtime.getEnv("ANON_KEY"),
        isServerMode: true,
        edgeFunctionToken: token,
      });

      const { data: userData } = await client.auth.getCurrentUser();
      if (!userData?.user?.id) {
        return { authenticated: false, user: null, error: "UNAUTHORIZED" };
      }

      return { authenticated: true, user: userData.user, error: null };
    },
  };
}
