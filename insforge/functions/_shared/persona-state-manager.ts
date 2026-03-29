import { getSnapshot, upsertSnapshot, createDefaultSnapshot, type PersonaSnapshot } from "./persona-snapshot-store.ts";
import { replayEvents } from "./persona-replay-engine.ts";
import { generateProjections } from "./persona-projections.ts";

interface EventInput {
  id: string;
  userId: string;
  type: string;
  version: number;
  payload: Record<string, unknown>;
  source: { surface: string; sessionId: string | null };
  timestamp: string;
  sequenceNumber: number;
}

interface DeltaResult {
  snapshot: PersonaSnapshot | null;
  error: { message: string } | null;
}

export async function applyDelta(
  userId: string,
  event: EventInput
): Promise<DeltaResult> {
  let snapshot = await getSnapshot(userId);
  if (!snapshot) {
    snapshot = createDefaultSnapshot(userId);
  }

  const updated = replayEvents(snapshot, [
    {
      id: event.id,
      type: event.type,
      payload: event.payload,
      sequenceNumber: event.sequenceNumber,
    },
  ]);

  updated.plainLanguageProjections = generateProjections(updated);
  updated.updatedAt = new Date().toISOString();

  const { error } = await upsertSnapshot(updated);
  if (error) {
    return { snapshot: null, error };
  }

  return { snapshot: updated, error: null };
}
