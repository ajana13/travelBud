import { createClient } from "npm:@insforge/sdk";

export function getDb() {
  const client = createClient({
    baseUrl: Deno.env.get("INSFORGE_BASE_URL"),
    anonKey: Deno.env.get("ANON_KEY"),
  });
  return client.database;
}
