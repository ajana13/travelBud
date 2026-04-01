import { getDb } from "./db.ts";

interface PersonaEventInput {
  id: string;
  userId: string;
  type: string;
  version: number;
  payload: Record<string, unknown>;
  source: { surface: string; sessionId: string | null };
  timestamp: string;
  sequenceNumber: number;
}

export async function appendEvent(
  event: PersonaEventInput
): Promise<{ error: { message: string } | null }> {
  const db = getDb();

  let seq = event.sequenceNumber;
  if (seq < 0) {
    seq = await getLatestSequence(event.userId) + 1;
  }

  const row = {
    id: event.id,
    user_id: event.userId,
    type: event.type,
    version: event.version,
    payload: event.payload,
    source: event.source,
    timestamp: event.timestamp,
    sequence_number: seq,
  };
  const { error } = await db.from("persona_events").insert([row]);

  return { error };
}

export async function getEvents(
  userId: string,
  opts?: { afterSequence?: number }
): Promise<Array<Record<string, unknown>>> {
  const db = getDb();
  const query = db.from("persona_events").select("*").eq("user_id", userId).order("sequence_number", { ascending: true });

  const { data, error } = await query;
  if (error || !data) return [];

  let result = data as Array<Record<string, unknown>>;
  if (opts?.afterSequence !== undefined) {
    result = result.filter(
      (r: any) => r.sequence_number > opts.afterSequence!
    );
  }
  return result;
}

export async function getLatestSequence(userId: string): Promise<number> {
  const events = await getEvents(userId);
  if (events.length === 0) return 0;
  return Math.max(...events.map((e: any) => e.sequence_number as number));
}
