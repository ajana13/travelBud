import { getRuntime } from "./platform/factory.ts";

export interface AppConfig {
  baseUrl: string;
  anonKey: string;
}

export function getConfig(): AppConfig {
  const runtime = getRuntime();
  return {
    baseUrl: runtime.getEnv("INSFORGE_BASE_URL") || runtime.getEnv("DATABASE_URL") || "",
    anonKey: runtime.getEnv("ANON_KEY") || runtime.getEnv("API_KEY") || "",
  };
}
