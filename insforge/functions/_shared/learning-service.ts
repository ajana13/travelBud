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

interface LearningQuestion {
  id: string;
  topicFamily: string;
  questionText: string;
  expectedLift: number;
  confidenceGap: number;
  channelEligibility: string[];
  answerSchema: Record<string, unknown>;
  isComparative: boolean;
  comparisonItems: { a: string; b: string } | null;
  sourceType: "template" | "llm_generated";
  sensitiveTopicFlag: boolean;
  createdAt: string;
  expiresAt: string | null;
}

interface LearningAnswerInput {
  questionId: string;
  answer: Record<string, unknown>;
  sourceSurface: "push" | "in_app_chat" | "attached_follow_up";
  linkedRecommendationId: string | null;
}

interface LearningPromptResult {
  prompt: LearningQuestion | null;
  sessionLearningCount: number;
  sessionCap: number;
}

interface LearningAnswerResult {
  accepted: boolean;
  personaUpdated: boolean;
  feedStale: boolean;
  followUpQuestion: LearningQuestion | null;
}

// ─── Constants ──────────────────────────────────────────────────────────────

export const SESSION_CAP = 5;

// ─── DB helper ──────────────────────────────────────────────────────────────


// ─── Row mapping ────────────────────────────────────────────────────────────

function rowToQuestion(row: Record<string, unknown>): LearningQuestion {
  return {
    id: row.id as string,
    topicFamily: row.topic_family as string,
    questionText: row.question_text as string,
    expectedLift: row.expected_lift as number,
    confidenceGap: row.confidence_gap as number,
    channelEligibility: (row.channel_eligibility || []) as string[],
    answerSchema: (row.answer_schema || {}) as Record<string, unknown>,
    isComparative: row.is_comparative as boolean,
    comparisonItems: row.comparison_items as { a: string; b: string } | null,
    sourceType: row.source_type as "template" | "llm_generated",
    sensitiveTopicFlag: row.sensitive_topic_flag as boolean,
    createdAt: row.created_at as string,
    expiresAt: (row.expires_at as string) || null,
  };
}

// ─── Session cap check ──────────────────────────────────────────────────────

export function checkSessionCap(snapshot: PersonaSnapshot): boolean {
  return snapshot.learningBudget.usedThisPeriod >= SESSION_CAP;
}

// ─── Cadence update ─────────────────────────────────────────────────────────

export function updateCadence(
  snapshot: PersonaSnapshot,
  answered: boolean
): PersonaSnapshot {
  const updated = { ...snapshot, cadenceState: { ...snapshot.cadenceState } };
  if (answered) {
    updated.cadenceState.answeredCount += 1;
  } else {
    updated.cadenceState.ignoredCount += 1;
  }
  const total =
    updated.cadenceState.answeredCount + updated.cadenceState.ignoredCount;
  updated.cadenceState.currentRate =
    total > 0 ? updated.cadenceState.answeredCount / total : 1;
  updated.cadenceState.lastUpdatedAt = new Date().toISOString();
  return updated;
}

// ─── Select next question ───────────────────────────────────────────────────

export async function selectNextQuestion(
  userId: string
): Promise<LearningPromptResult> {
  const snapshot =
    (await getSnapshot(userId)) ?? createDefaultSnapshot(userId);
  const used = snapshot.learningBudget.usedThisPeriod;

  if (checkSessionCap(snapshot)) {
    return { prompt: null, sessionLearningCount: used, sessionCap: SESSION_CAP };
  }

  const db = getDb();
  const now = new Date().toISOString();

  const { data, error } = await db
    .from("learning_questions")
    .select("*")
    .order("expected_lift", { ascending: false })
    .limit(20);

  if (error || !data || (data as unknown[]).length === 0) {
    return { prompt: null, sessionLearningCount: used, sessionCap: SESSION_CAP };
  }

  const rows = data as Array<Record<string, unknown>>;
  const candidates = rows
    .map(rowToQuestion)
    .filter((q) => !q.expiresAt || q.expiresAt > now);

  if (candidates.length === 0) {
    return { prompt: null, sessionLearningCount: used, sessionCap: SESSION_CAP };
  }

  return {
    prompt: candidates[0],
    sessionLearningCount: used,
    sessionCap: SESSION_CAP,
  };
}

// ─── Ingest answer ──────────────────────────────────────────────────────────

export async function ingestAnswer(
  userId: string,
  input: LearningAnswerInput
): Promise<LearningAnswerResult> {
  const db = getDb();
  const answerRow = {
    id: crypto.randomUUID(),
    user_id: userId,
    question_id: input.questionId,
    answer_payload: input.answer,
    source_surface: input.sourceSurface,
    linked_recommendation_id: input.linkedRecommendationId,
    created_at: new Date().toISOString(),
  };
  await db.from("learning_answers").insert([answerRow]);

  const seq = (await getLatestSequence(userId)) + 1;
  const event = {
    id: crypto.randomUUID(),
    userId,
    type: "learning_answer",
    version: 1,
    payload: {
      questionId: input.questionId,
      answer: input.answer,
      sourceSurface: input.sourceSurface,
      linkedRecommendationId: input.linkedRecommendationId,
    },
    source: { surface: input.sourceSurface, sessionId: null },
    timestamp: new Date().toISOString(),
    sequenceNumber: seq,
  };

  await appendEvent(event);
  const { snapshot, error } = await applyDelta(userId, event);

  if (error || !snapshot) {
    return {
      accepted: true,
      personaUpdated: false,
      feedStale: false,
      followUpQuestion: null,
    };
  }

  return {
    accepted: true,
    personaUpdated: true,
    feedStale: true,
    followUpQuestion: null,
  };
}

