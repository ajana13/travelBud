import { describe, it, expect, beforeEach } from "vitest";
import { applyDelta } from "../../../../insforge/functions/_shared/persona-state-manager.ts";
import { seedTable, getTableData, resetMock } from "../../mocks/insforge-sdk.ts";
import { createDefaultSnapshot } from "../../../../insforge/functions/_shared/persona-snapshot-store.ts";

const USER_ID = "user-state-001";

beforeEach(() => resetMock());

describe("persona-state-manager", () => {
  describe("applyDelta()", () => {
    it("creates snapshot and processes event for new user", async () => {
      const event = {
        id: "evt-001",
        userId: USER_ID,
        type: "action" as const,
        version: 1,
        payload: {
          type: "action" as const,
          actionType: "im_in" as const,
          itemId: "item-1",
          reasons: null,
          freeText: null,
        },
        source: { surface: "feed", sessionId: "s1" },
        timestamp: new Date().toISOString(),
        sequenceNumber: 1,
      };
      const result = await applyDelta(USER_ID, event);
      expect(result.error).toBeNull();
      expect(result.snapshot).toBeDefined();
      expect(result.snapshot!.lastEventSequence).toBe(1);
    });

    it("updates existing snapshot with new event", async () => {
      seedTable("persona_snapshots", [
        {
          id: USER_ID,
          user_id: USER_ID,
          version: 1,
          preferences: { pillar: {}, tags: {} },
          hard_filters: [],
          cadence_state: { answeredCount: 0, ignoredCount: 0, currentRate: 1, lastUpdatedAt: "t" },
          learning_budget: { usedThisPeriod: 0, periodStart: "s", periodEnd: "e" },
          boost_state: { completed: false, skipped: false, startedAt: null, completedAt: null },
          travel_state: { isAway: false, currentLocation: null, homeLocation: { lat: 47.6, lng: -122.3 } },
          plain_language_projections: [],
          last_event_sequence: 0,
          rebuilt_at: "t",
          updated_at: "t",
        },
      ]);
      const event = {
        id: "evt-002",
        userId: USER_ID,
        type: "learning_answer" as const,
        version: 1,
        payload: {
          type: "learning_answer" as const,
          questionId: "q-1",
          answer: { val: "yes" },
          sourceSurface: "push" as const,
          linkedRecommendationId: null,
        },
        source: { surface: "push", sessionId: null },
        timestamp: new Date().toISOString(),
        sequenceNumber: 1,
      };
      const result = await applyDelta(USER_ID, event);
      expect(result.error).toBeNull();
      expect(result.snapshot!.cadenceState.answeredCount).toBe(1);
    });
  });
});
