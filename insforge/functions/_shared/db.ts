import { createClient } from "npm:@insforge/sdk";

export function setEdgeFunctionToken(_token: string | null) {
  // Reserved for future per-request auth scoping
}

export function getDb() {
  const internalUrl = Deno.env.get("INSFORGE_INTERNAL_URL");
  const apiKey = Deno.env.get("API_KEY");
  const client = createClient({
    baseUrl: internalUrl || Deno.env.get("INSFORGE_BASE_URL"),
    anonKey: apiKey || Deno.env.get("ANON_KEY"),
  });
  return client.database;
}
