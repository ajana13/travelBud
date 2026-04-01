import { getDb } from "./db.ts";
import { appendEvent, getLatestSequence } from "./persona-event-store.ts";
import { applyDelta } from "./persona-state-manager.ts";
import {
  getSnapshot,
  createDefaultSnapshot,
  upsertSnapshot,
  type PersonaSnapshot,
} from "./persona-snapshot-store.ts";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PersonaUpdate {
  field: string;
  oldValue: string;
  newValue: string;
}

interface ChatReplyResult {
  reply: string;
  conversationId: string;
  personaUpdatesApplied: PersonaUpdate[];
  feedStale: boolean;
}

interface BoostStartResult {
  boostId: string;
  status: "processing" | "completed" | "failed";
}

interface BoostInference {
  id: string;
  userId: string;
  sourceType: string;
  sourceDetail: string;
  inferredPreference: {
    category: string;
    direction: "positive" | "negative";
    strength: number;
  };
  confidence: number;
  visibilityState: "pending" | "visible" | "hidden";
  acceptanceStatus: "pending" | "accepted" | "rejected" | "edited";
  plainLanguageLabel: string;
  createdAt: string;
  resolvedAt: string | null;
}

interface BoostStatusResult {
  status: "not_started" | "processing" | "completed" | "skipped";
  inferences: BoostInference[];
  startedAt: string | null;
  completedAt: string | null;
}

// ─── DB helper ──────────────────────────────────────────────────────────────


// ─── Mock LLM ───────────────────────────────────────────────────────────────

function mockLlmReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("sushi") || lower.includes("food") || lower.includes("eat")) {
    return "Great taste! I've noted your food preferences. What kind of dining atmosphere do you prefer?";
  }
  if (lower.includes("outdoor") || lower.includes("hike") || lower.includes("nature")) {
    return "Love it! Outdoor activities are fantastic. Do you prefer challenging hikes or easy scenic walks?";
  }
  if (lower.includes("music") || lower.includes("concert") || lower.includes("live")) {
    return "Nice! Live music is a great experience. Any particular genres you're drawn to?";
  }
  return "Thanks for sharing! That helps me understand your preferences better. Tell me more about what you enjoy.";
}

function extractPreferences(message: string): Array<{ category: string; direction: "positive" | "negative"; strength: number }> {
  const prefs: Array<{ category: string; direction: "positive" | "negative"; strength: number }> = [];
  const lower = message.toLowerCase();
  if (lower.includes("love") || lower.includes("like") || lower.includes("enjoy")) {
    if (lower.includes("sushi")) prefs.push({ category: "sushi", direction: "positive", strength: 0.7 });
    if (lower.includes("hik")) prefs.push({ category: "hiking", direction: "positive", strength: 0.7 });
    if (lower.includes("music")) prefs.push({ category: "live-music", direction: "positive", strength: 0.7 });
    if (lower.includes("outdoor")) prefs.push({ category: "outdoors", direction: "positive", strength: 0.6 });
    if (lower.includes("food")) prefs.push({ category: "dining", direction: "positive", strength: 0.5 });
  }
  if (lower.includes("hate") || lower.includes("dislike") || lower.includes("avoid")) {
    if (lower.includes("crowd")) prefs.push({ category: "crowded-venues", direction: "negative", strength: 0.6 });
    if (lower.includes("loud")) prefs.push({ category: "loud-venues", direction: "negative", strength: 0.5 });
  }
  return prefs;
}

// ─── Chat reply ─────────────────────────────────────────────────────────────

export async function generateChatReply(
  userId: string,
  message: string,
  conversationId: string | null
): Promise<ChatReplyResult> {
  const convId = conversationId ?? crypto.randomUUID();
  const reply = mockLlmReply(message);
  const prefs = extractPreferences(message);
  const updates: PersonaUpdate[] = [];

  for (const pref of prefs) {
    const seq = (await getLatestSequence(userId)) + 1;
    const event = {
      id: crypto.randomUUID(),
      userId,
      type: "chat_extraction",
      version: 1,
      payload: {
        conversationId: convId,
        field: pref.category,
        oldValue: null,
        newValue: pref.direction === "positive" ? "likes " + pref.category : "avoids " + pref.category,
      },
      source: { surface: "in_app_chat", sessionId: convId },
      timestamp: new Date().toISOString(),
      sequenceNumber: seq,
    };
    await appendEvent(event);
    await applyDelta(userId, event);
    updates.push({
      field: pref.category,
      oldValue: "",
      newValue: pref.direction === "positive" ? "likes " + pref.category : "avoids " + pref.category,
    });
  }

  return {
    reply,
    conversationId: convId,
    personaUpdatesApplied: updates,
    feedStale: updates.length > 0,
  };
}

// ─── Persona Boost ──────────────────────────────────────────────────────────

export async function startPersonaBoost(
  userId: string,
  email: string,
  consentGiven: boolean
): Promise<BoostStartResult> {
  if (!consentGiven) {
    return { boostId: "", status: "failed" };
  }

  const snapshot = (await getSnapshot(userId)) ?? createDefaultSnapshot(userId);

  if (snapshot.boostState.completed) {
    return { boostId: crypto.randomUUID(), status: "completed" };
  }

  const boostId = crypto.randomUUID();
  const now = new Date().toISOString();
  const db = getDb();

  const mockInferences = [
    { category: "dining", direction: "positive" as const, strength: 0.6, label: "Enjoys trying new restaurants" },
    { category: "outdoors", direction: "positive" as const, strength: 0.5, label: "Interested in outdoor activities" },
    { category: "nightlife", direction: "negative" as const, strength: 0.4, label: "Prefers quieter evenings" },
  ];

  for (const inf of mockInferences) {
    const infId = crypto.randomUUID();
    const row = {
      id: infId,
      user_id: userId,
      source_type: "email_analysis",
      source_detail: email,
      inferred_preference: { category: inf.category, direction: inf.direction, strength: inf.strength },
      confidence: 0.65,
      visibility_state: "visible",
      acceptance_status: "pending",
      plain_language_label: inf.label,
      created_at: now,
      resolved_at: null,
    };
    await db.from("boost_inferences").insert([row]);

    const seq = (await getLatestSequence(userId)) + 1;
    const event = {
      id: crypto.randomUUID(),
      userId,
      type: "boost_inference",
      version: 1,
      payload: {
        inferenceId: infId,
        category: inf.category,
        direction: inf.direction,
        strength: inf.strength,
        accepted: false,
      },
      source: { surface: "boost", sessionId: boostId },
      timestamp: now,
      sequenceNumber: seq,
    };
    await appendEvent(event);
  }

  snapshot.boostState.startedAt = now;
  snapshot.boostState.completed = true;
  snapshot.boostState.completedAt = now;
  snapshot.updatedAt = now;
  await upsertSnapshot(snapshot);

  return { boostId, status: "completed" };
}

export async function getBoostStatus(
  userId: string
): Promise<BoostStatusResult> {
  const snapshot = (await getSnapshot(userId)) ?? createDefaultSnapshot(userId);
  const db = getDb();

  let status: BoostStatusResult["status"] = "not_started";
  if (snapshot.boostState.skipped) status = "skipped";
  else if (snapshot.boostState.completed) status = "completed";
  else if (snapshot.boostState.startedAt) status = "processing";

  const { data } = await db
    .from("boost_inferences")
    .select("*")
    .eq("user_id", userId);

  const inferences: BoostInference[] = ((data as Array<Record<string, unknown>> | null) || []).map((row) => ({
    id: row.id as string,
    userId: row.user_id as string,
    sourceType: row.source_type as string,
    sourceDetail: row.source_detail as string,
    inferredPreference: row.inferred_preference as BoostInference["inferredPreference"],
    confidence: row.confidence as number,
    visibilityState: row.visibility_state as BoostInference["visibilityState"],
    acceptanceStatus: row.acceptance_status as BoostInference["acceptanceStatus"],
    plainLanguageLabel: row.plain_language_label as string,
    createdAt: row.created_at as string,
    resolvedAt: (row.resolved_at as string) || null,
  }));

  return {
    status,
    inferences,
    startedAt: snapshot.boostState.startedAt,
    completedAt: snapshot.boostState.completedAt,
  };
}

