import { getDb } from "./db.ts";

export interface PersonaSnapshot {
  userId: string;
  version: number;
  preferences: { pillar: Record<string, number>; tags: Record<string, number> };
  hardFilters: Array<{
    id: string;
    category: string;
    label: string;
    active: boolean;
    promotedFrom: string | null;
    createdAt: string;
  }>;
  cadenceState: {
    answeredCount: number;
    ignoredCount: number;
    currentRate: number;
    lastUpdatedAt: string;
  };
  learningBudget: {
    usedThisPeriod: number;
    standaloneCount: number;
    attachedCount: number;
    periodStart: string;
    periodEnd: string;
  };
  boostState: {
    completed: boolean;
    skipped: boolean;
    startedAt: string | null;
    completedAt: string | null;
  };
  travelState: {
    isAway: boolean;
    currentLocation: { lat: number; lng: number } | null;
    homeLocation: { lat: number; lng: number };
  };
  plainLanguageProjections: Array<{
    id: string;
    category: string;
    statement: string;
    confidence: string;
    editable: boolean;
  }>;
  lastEventSequence: number;
  rebuiltAt: string;
  updatedAt: string;
}

export function createDefaultSnapshot(userId: string): PersonaSnapshot {
  const now = new Date().toISOString();
  return {
    userId,
    version: 1,
    preferences: { pillar: {}, tags: {} },
    hardFilters: [],
    cadenceState: { answeredCount: 0, ignoredCount: 0, currentRate: 1, lastUpdatedAt: now },
    learningBudget: { usedThisPeriod: 0, standaloneCount: 0, attachedCount: 0, periodStart: now, periodEnd: now },
    boostState: { completed: false, skipped: false, startedAt: null, completedAt: null },
    travelState: { isAway: false, currentLocation: null, homeLocation: { lat: 47.6062, lng: -122.3321 } },
    plainLanguageProjections: [],
    lastEventSequence: 0,
    rebuiltAt: now,
    updatedAt: now,
  };
}

function rowToSnapshot(row: Record<string, unknown>): PersonaSnapshot {
  return {
    userId: row.user_id as string,
    version: row.version as number,
    preferences: row.preferences as PersonaSnapshot["preferences"],
    hardFilters: (row.hard_filters || []) as PersonaSnapshot["hardFilters"],
    cadenceState: row.cadence_state as PersonaSnapshot["cadenceState"],
    learningBudget: row.learning_budget as PersonaSnapshot["learningBudget"],
    boostState: row.boost_state as PersonaSnapshot["boostState"],
    travelState: row.travel_state as PersonaSnapshot["travelState"],
    plainLanguageProjections: (row.plain_language_projections || []) as PersonaSnapshot["plainLanguageProjections"],
    lastEventSequence: row.last_event_sequence as number,
    rebuiltAt: row.rebuilt_at as string,
    updatedAt: row.updated_at as string,
  };
}

function snapshotToRow(snap: PersonaSnapshot): Record<string, unknown> {
  return {
    id: snap.userId,
    user_id: snap.userId,
    version: snap.version,
    preferences: snap.preferences,
    hard_filters: snap.hardFilters,
    cadence_state: snap.cadenceState,
    learning_budget: snap.learningBudget,
    boost_state: snap.boostState,
    travel_state: snap.travelState,
    plain_language_projections: snap.plainLanguageProjections,
    last_event_sequence: snap.lastEventSequence,
    rebuilt_at: snap.rebuiltAt,
    updated_at: snap.updatedAt,
  };
}

export async function getSnapshot(userId: string): Promise<PersonaSnapshot | null> {
  const db = getDb();
  const { data, error } = await db.from("persona_snapshots").select("*").eq("user_id", userId).maybeSingle();
  if (error || !data) return null;
  return rowToSnapshot(data as Record<string, unknown>);
}

export async function upsertSnapshot(
  snap: PersonaSnapshot
): Promise<{ error: { message: string } | null }> {
  const db = getDb();
  const row = snapshotToRow(snap);
  const { error } = await db.from("persona_snapshots").upsert(row);
  return { error };
}
