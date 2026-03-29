export interface AppConfig {
  baseUrl: string;
  anonKey: string;
}

export function getConfig(): AppConfig {
  return {
    baseUrl: Deno.env.get("INSFORGE_BASE_URL") || "",
    anonKey: Deno.env.get("ANON_KEY") || "",
  };
}
