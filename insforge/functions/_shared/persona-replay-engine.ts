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
  pass: -0.15,
  cant: 0,
};

const AMBIGUITY_DISCOUNT = 0.5;

export function applyAction(
  snap: PersonaSnapshot,
  payload: ActionPayload,
  meta?: { tags?: string[] }
): PersonaSnapshot {
  const result = cloneSnap(snap);
  const baseWeight = ACTION_WEIGHTS[payload.actionType] ?? 0;
  if (meta?.tags) {
    for (const tag of meta.tags) {
      const current = result.preferences.tags[tag] || 0;
      let weight = baseWeight;

      if (payload.actionType === "pass") {
        if (current > 0) {
          // Contradiction: positive signal contradicted by pass, accelerate decay
          weight = baseWeight * 1.5;
        } else if (Math.abs(current) < 0.3) {
          // Ambiguity-first: discount the negative when confidence is already low
          weight = baseWeight * AMBIGUITY_DISCOUNT;
        }
      } else if (payload.actionType === "im_in" && current < 0) {
        // Contradiction: positive signal overrides stale negative faster
        weight = baseWeight * 1.5;
      }

      result.preferences.tags[tag] = current + weight;
    }
  }
  return result;
}

export function decayPreferences(snap: PersonaSnapshot, factor = 0.05): PersonaSnapshot {
  const result = cloneSnap(snap);
  for (const tag of Object.keys(result.preferences.tags)) {
    const val = result.preferences.tags[tag];
    if (Math.abs(val) < 0.01) {
      delete result.preferences.tags[tag];
    } else {
      result.preferences.tags[tag] = val * (1 - factor);
    }
  }
  for (const pillar of Object.keys(result.preferences.pillar)) {
    const val = result.preferences.pillar[pillar];
    if (Math.abs(val) < 0.01) {
      delete result.preferences.pillar[pillar];
    } else {
      result.preferences.pillar[pillar] = val * (1 - factor);
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
  if (payload.sourceSurface === "attached_follow_up") {
    result.learningBudget.attachedCount = (result.learningBudget.attachedCount || 0) + 1;
  } else {
    result.learningBudget.standaloneCount = (result.learningBudget.standaloneCount || 0) + 1;
  }
  return result;
}

export function applyChatExtraction(
  snap: PersonaSnapshot,
  payload: ChatExtractionPayload
): PersonaSnapshot {
  const result = cloneSnap(snap);
  if (payload.field) {
    const isNegative = payload.newValue?.toLowerCase().startsWith("avoids");
    const delta = isNegative ? -0.3 : 0.3;
    result.preferences.tags[payload.field] =
      (result.preferences.tags[payload.field] || 0) + delta;
  }
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
      current = handler(current, event.payload as unknown as AnyPayload);
    }
    current.lastEventSequence = event.sequenceNumber;
  }
  current.updatedAt = new Date().toISOString();
  return current;
}
