import { createClient } from "npm:@insforge/sdk";
import type { DatabasePort, AuthPort, AuthResult, RuntimePort } from "./ports.ts";

// ─── Runtime ────────────────────────────────────────────────────────────────

export class InsForgeRuntime implements RuntimePort {
  getEnv(key: string): string | undefined {
    return Deno.env.get(key);
  }
}

// ─── Database ───────────────────────────────────────────────────────────────

export class InsForgeDatabase implements DatabasePort {
  private runtime: RuntimePort;

  constructor(runtime: RuntimePort) {
    this.runtime = runtime;
  }

  from(table: string) {
    const internalUrl = this.runtime.getEnv("INSFORGE_INTERNAL_URL");
    const apiKey = this.runtime.getEnv("API_KEY");
    const client = createClient({
      baseUrl: internalUrl || this.runtime.getEnv("INSFORGE_BASE_URL"),
      anonKey: apiKey || this.runtime.getEnv("ANON_KEY"),
    });
    return client.database.from(table);
  }
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export class InsForgeAuth implements AuthPort {
  private runtime: RuntimePort;

  constructor(runtime: RuntimePort) {
    this.runtime = runtime;
  }

  async authenticateRequest(req: Request): Promise<AuthResult> {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader ? authHeader.replace("Bearer ", "") : null;

    if (!token) {
      return { authenticated: false, user: null, error: "UNAUTHORIZED" };
    }

    const client = createClient({
      baseUrl: this.runtime.getEnv("INSFORGE_BASE_URL"),
      anonKey: this.runtime.getEnv("ANON_KEY"),
      isServerMode: true,
      edgeFunctionToken: token,
    });

    const { data: userData } = await client.auth.getCurrentUser();
    if (!userData?.user?.id) {
      return { authenticated: false, user: null, error: "UNAUTHORIZED" };
    }

    return { authenticated: true, user: userData.user, error: null };
  }
}
