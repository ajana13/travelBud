import { appendEvent, getLatestSequence } from "./persona-event-store.ts";
import { applyDelta } from "./persona-state-manager.ts";
import {
  getSnapshot,
  createDefaultSnapshot,
  upsertSnapshot,
  type PersonaSnapshot,
} from "./persona-snapshot-store.ts";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ActionInput {
  recommendationId: string;
  actionType: "im_in" | "maybe" | "pass" | "cant";
  reasons: string[] | null;
  freeText: string | null;
}

interface ActionResult {
  accepted: boolean;
  personaUpdated: boolean;
  eligibleFollowUp: null;
  feedStale: boolean;
}

interface PersonaEditInput {
  projectionId: string;
  newValue: string;
}

interface HardFilterToggle {
  filterId: string;
  active: boolean;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const HARD_FILTER_THRESHOLD = 3;

// ─── Action processing ──────────────────────────────────────────────────────

export async function processAction(
  userId: string,
  action: ActionInput,
  itemTags: string[]
): Promise<ActionResult> {
  const seq = (await getLatestSequence(userId)) + 1;

  const event = {
    id: crypto.randomUUID(),
    userId,
    type: "action",
    version: 1,
    payload: {
      actionType: action.actionType,
      itemId: action.recommendationId,
      reasons: action.reasons ?? [],
      freeText: action.freeText ?? "",
      tags: itemTags,
    },
    source: { surface: "app", sessionId: null },
    timestamp: new Date().toISOString(),
    sequenceNumber: seq,
  };

  await appendEvent(event);

  const { snapshot, error } = await applyDelta(userId, event);
  if (error || !snapshot) {
    return {
      accepted: true,
      personaUpdated: false,
      eligibleFollowUp: null,
      feedStale: false,
    };
  }

  const isNegative = action.actionType === "pass" || action.actionType === "cant";
  if (isNegative && itemTags.length > 0) {
    await checkHardFilterPromotion(userId, snapshot, itemTags);
  }

  return {
    accepted: true,
    personaUpdated: true,
    eligibleFollowUp: null,
    feedStale: true,
  };
}

// ─── Hard-filter promotion ──────────────────────────────────────────────────

async function checkHardFilterPromotion(
  userId: string,
  snapshot: PersonaSnapshot,
  tags: string[]
): Promise<void> {
  for (const tag of tags) {
    const negScore = snapshot.preferences.tags[tag] ?? 0;
    if (negScore <= -0.2 * HARD_FILTER_THRESHOLD) {
      const alreadyFiltered = snapshot.hardFilters.some(
        (f) => f.category === tag && f.active
      );
      if (!alreadyFiltered) {
        snapshot.hardFilters.push({
          id: crypto.randomUUID(),
          category: tag,
          label: "Auto-filtered: " + tag,
          active: true,
          promotedFrom: "negative_signal",
          createdAt: new Date().toISOString(),
        });
        await upsertSnapshot(snapshot);
      }
    }
  }
}

export function shouldPromoteHardFilter(
  snapshot: PersonaSnapshot,
  category: string
): boolean {
  const score = snapshot.preferences.tags[category] ?? 0;
  return score <= -0.2 * HARD_FILTER_THRESHOLD;
}

// ─── Persona read ───────────────────────────────────────────────────────────

export async function getPersonaView(userId: string): Promise<{
  projections: PersonaSnapshot["plainLanguageProjections"];
  hardFilters: Array<{ id: string; label: string; active: boolean; promotedFrom: string | null }>;
  boostState: { completed: boolean; skipped: boolean };
}> {
  const snapshot = (await getSnapshot(userId)) ?? createDefaultSnapshot(userId);

  return {
    projections: snapshot.plainLanguageProjections,
    hardFilters: snapshot.hardFilters.map((f) => ({
      id: f.id,
      label: f.label,
      active: f.active,
      promotedFrom: f.promotedFrom,
    })),
    boostState: {
      completed: snapshot.boostState.completed,
      skipped: snapshot.boostState.skipped,
    },
  };
}

// ─── Persona edit ───────────────────────────────────────────────────────────

export async function applyPersonaEdits(
  userId: string,
  edits: PersonaEditInput[],
  toggles: HardFilterToggle[]
): Promise<{
  updated: boolean;
  projections: PersonaSnapshot["plainLanguageProjections"];
  feedStale: boolean;
}> {
  let snapshot = (await getSnapshot(userId)) ?? createDefaultSnapshot(userId);
  let changed = false;

  for (const edit of edits) {
    const proj = snapshot.plainLanguageProjections.find(
      (p) => p.id === edit.projectionId
    );
    if (proj && proj.editable) {
      const seq = (await getLatestSequence(userId)) + 1;
      const event = {
        id: crypto.randomUUID(),
        userId,
        type: "persona_edit",
        version: 1,
        payload: {
          projectionId: edit.projectionId,
          oldValue: proj.statement,
          newValue: edit.newValue,
        },
        source: { surface: "app", sessionId: null },
        timestamp: new Date().toISOString(),
        sequenceNumber: seq,
      };
      await appendEvent(event);
      const result = await applyDelta(userId, event);
      if (result.snapshot) {
        snapshot = result.snapshot;
        changed = true;
      }
    }
  }

  for (const toggle of toggles) {
    const filter = snapshot.hardFilters.find((f) => f.id === toggle.filterId);
    if (filter) {
      filter.active = toggle.active;
      changed = true;
    }
  }

  if (changed) {
    snapshot.updatedAt = new Date().toISOString();
    await upsertSnapshot(snapshot);
  }

  return {
    updated: changed,
    projections: snapshot.plainLanguageProjections,
    feedStale: changed,
  };
}
