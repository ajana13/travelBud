import { getDb } from "./db.ts";

export async function getFeatureFlag(
  flagName: string
): Promise<Record<string, unknown> | null> {
  const db = getDb();
  const { data, error } = await db.from("feature_flags").select("*").eq("flag_name", flagName).maybeSingle();
  if (error || !data) return null;
  return data as Record<string, unknown>;
}

export async function isFeatureEnabled(flagName: string): Promise<boolean> {
  const flag = await getFeatureFlag(flagName);
  return flag?.enabled === true;
}
