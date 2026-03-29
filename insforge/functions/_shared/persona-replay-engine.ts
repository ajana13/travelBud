import type { PersonaSnapshot } from "./persona-snapshot-store.ts";

interface EventLike {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  sequenceNumber: number;
}

interface ActionPayload {
  type: "action";
  actionType: "im_in" | "maybe" | "pass" | "cant";
  itemId: string;
  reasons: string[] | null;
  freeText: string | null;
}

interface BoostInferencePayload {
  type: "boost_inference";
  inferenceId: string;
  category: string;
  direction: "positive" | "negative";
  strength: number;
  accepted: boolean;
}

interface LearningAnswerPayload {
  type: "learning_answer";
  questionId: string;
  answer: Record<string, unknown>;
  sourceSurface: "push" | "in_app_chat" | "attached_follow_up";
  linkedRecommendationId: string | null;
}

interface ChatExtractionPayload {
  type: "chat_extraction";
  conversationId: string;
  field: string;
  oldValue: string | null;
  newValue: string;
}

interface ConfirmationPayload {
  type: "confirmation";
  itemId: string;
  confirmed: boolean;
  feedback: string | null;
}

interface SystemDecisionPayload {
  type: "system_decision";
  decisionType: string;
  reason: string;
  affectedField: string;
  previousValue: unknown;
  newValue: unknown;
}

interface PersonaEditPayload {
  type: "persona_edit";
  projectionId: string;
  oldValue: string;
  newValue: string;
}

function cloneSnap(snap: PersonaSnapshot): PersonaSnapshot {
  return JSON.parse(JSON.stringify(snap));
}

const ACTION_WEIGHTS: Record<string, number> = {
  im_in: 0.3,
  maybe: 0.1,
  pass: -0.2,
  cant: 0,
};

export function applyAction(
  snap: PersonaSnapshot,
  payload: ActionPayload,
  meta?: { tags?: string[] }
): PersonaSnapshot {
  const result = cloneSnap(snap);
  const weight = ACTION_WEIGHTS[payload.actionType] ?? 0;
  if (meta?.tags) {
    for (const tag of meta.tags) {
      result.preferences.tags[tag] = (result.preferences.tags[tag] || 0) + weight;
    }
  }
  return result;
}

export function applyBoostInference(
  snap: PersonaSnapshot,
  payload: BoostInferencePayload
): PersonaSnapshot {
  const result = cloneSnap(snap);
  if (!payload.accepted) return result;
  const delta = payload.direction === "positive" ? payload.strength : -payload.strength;
  result.preferences.tags[payload.category] =
    (result.preferences.tags[payload.category] || 0) + delta;
  return result;
}

export function applyLearningAnswer(
  snap: PersonaSnapshot,
  payload: LearningAnswerPayload
): PersonaSnapshot {
  const result = cloneSnap(snap);
  result.cadenceState.answeredCount += 1;
  result.cadenceState.lastUpdatedAt = new Date().toISOString();
  result.learningBudget.usedThisPeriod += 1;
  return result;
}

export function applyChatExtraction(
  snap: PersonaSnapshot,
  payload: ChatExtractionPayload
): PersonaSnapshot {
  const result = cloneSnap(snap);
  return result;
}

export function applyConfirmation(
  snap: PersonaSnapshot,
  payload: ConfirmationPayload
): PersonaSnapshot {
  const result = cloneSnap(snap);
  return result;
}

export function applySystemDecision(
  snap: PersonaSnapshot,
  payload: SystemDecisionPayload
): PersonaSnapshot {
  const result = cloneSnap(snap);
  return result;
}

export function applyPersonaEdit(
  snap: PersonaSnapshot,
  payload: PersonaEditPayload
): PersonaSnapshot {
  const result = cloneSnap(snap);
  const proj = result.plainLanguageProjections.find(
    (p) => p.id === payload.projectionId
  );
  if (proj) {
    proj.statement = payload.newValue;
  }
  return result;
}

type AnyPayload =
  | ActionPayload
  | BoostInferencePayload
  | LearningAnswerPayload
  | ChatExtractionPayload
  | ConfirmationPayload
  | SystemDecisionPayload
  | PersonaEditPayload;

const handlers: Record<string, (snap: PersonaSnapshot, payload: any) => PersonaSnapshot> = {
  action: applyAction,
  boost_inference: applyBoostInference,
  learning_answer: applyLearningAnswer,
  chat_extraction: applyChatExtraction,
  confirmation: applyConfirmation,
  system_decision: applySystemDecision,
  persona_edit: applyPersonaEdit,
};

export function replayEvents(
  snapshot: PersonaSnapshot,
  events: EventLike[]
): PersonaSnapshot {
  let current = cloneSnap(snapshot);
  for (const event of events) {
    const handler = handlers[event.type];
    if (handler) {
      current = handler(current, event.payload as AnyPayload);
    }
    current.lastEventSequence = event.sequenceNumber;
  }
  current.updatedAt = new Date().toISOString();
  return current;
}
