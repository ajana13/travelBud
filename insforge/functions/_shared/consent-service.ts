import { getDatabase } from "./platform/factory.ts";

interface ConsentInput {
  userId: string;
  consentType: string;
  granted: boolean;
}

export async function recordConsent(
  input: ConsentInput
): Promise<{ error: { message: string } | null }> {
  const db = getDatabase();
  const row = {
    id: crypto.randomUUID(),
    user_id: input.userId,
    consent_type: input.consentType,
    granted: input.granted,
    revoked_at: null,
    created_at: new Date().toISOString(),
  };
  const { error } = await db.from("consent_records").insert([row]);
  return { error };
}

export async function getActiveConsents(
  userId: string
): Promise<Array<Record<string, unknown>>> {
  const db = getDatabase();
  const { data, error } = await db.from("consent_records").select("*").eq("user_id", userId).eq("granted", true);
  if (error || !data) return [];
  return data as Array<Record<string, unknown>>;
}

export async function revokeConsent(
  userId: string,
  consentType: string
): Promise<{ error: { message: string } | null }> {
  const db = getDatabase();
  const { error } = await db.from("consent_records").update({ revoked_at: new Date().toISOString(), granted: false }).eq("user_id", userId).eq("consent_type", consentType);
  return { error };
}
