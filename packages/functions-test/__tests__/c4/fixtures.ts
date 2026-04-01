import { createDefaultSnapshot, type PersonaSnapshot } from "../../../../insforge/functions/_shared/persona-snapshot-store.ts";
import { replayEvents, applyAction, decayPreferences } from "../../../../insforge/functions/_shared/persona-replay-engine.ts";

type ActionType = "im_in" | "maybe" | "pass" | "cant";

interface ScenarioStep {
  actionType: ActionType;
  tags: string[];
  reasons?: string[];
  freeText?: string;
}

interface ScenarioResult {
  snapshot: PersonaSnapshot;
  eventCount: number;
}

export function createScenario(userId: string): { snapshot: PersonaSnapshot; steps: ScenarioStep[] } {
  return {
    snapshot: createDefaultSnapshot(userId),
    steps: [],
  };
}

export function replayScenario(userId: string, steps: ScenarioStep[]): ScenarioResult {
  const snapshot = createDefaultSnapshot(userId);
  const events = steps.map((step, idx) => ({
    id: `evt-${idx}`,
    type: "action",
    payload: {
      type: "action" as const,
      actionType: step.actionType,
      itemId: `item-${idx}`,
      reasons: step.reasons ?? null,
      freeText: step.freeText ?? null,
      tags: step.tags,
    },
    sequenceNumber: idx + 1,
  }));

  const result = replayEvents(snapshot, events);
  return { snapshot: result, eventCount: events.length };
}

export function replayActionSequence(
  userId: string,
  actions: Array<{ actionType: ActionType; tags: string[] }>
): PersonaSnapshot {
  let snap = createDefaultSnapshot(userId);
  for (const action of actions) {
    snap = applyAction(
      snap,
      {
        type: "action",
        actionType: action.actionType,
        itemId: "item-" + Math.random().toString(36).slice(2, 8),
        reasons: null,
        freeText: null,
      },
      { tags: action.tags }
    );
  }
  return snap;
}

export function applyDecay(snap: PersonaSnapshot, factor?: number): PersonaSnapshot {
  return decayPreferences(snap, factor);
}

export function assertTagScore(
  snap: PersonaSnapshot,
  tag: string,
  check: "positive" | "negative" | "zero" | "absent"
): void {
  const score = snap.preferences.tags[tag];
  switch (check) {
    case "positive":
      if (score === undefined || score <= 0) throw new Error(`Expected tag "${tag}" to be positive, got ${score}`);
      break;
    case "negative":
      if (score === undefined || score >= 0) throw new Error(`Expected tag "${tag}" to be negative, got ${score}`);
      break;
    case "zero":
      if (score !== 0) throw new Error(`Expected tag "${tag}" to be zero, got ${score}`);
      break;
    case "absent":
      if (score !== undefined) throw new Error(`Expected tag "${tag}" to be absent, got ${score}`);
      break;
  }
}

export { createDefaultSnapshot, type PersonaSnapshot };
