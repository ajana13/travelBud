import { describe, it, expect, beforeEach } from "vitest";
import {
  processAction,
  shouldPromoteHardFilter,
  getPersonaView,
  applyPersonaEdits,
} from "../../../../insforge/functions/_shared/feedback-service.ts";
import { seedTable, getTableData, resetMock } from "../../mocks/insforge-sdk.ts";

beforeEach(() => resetMock());

describe("feedback-service", () => {
  describe("processAction()", () => {
    it("accepts an im_in action and updates persona", async () => {
      const result = await processAction(
        "user-001",
        { recommendationId: "rec-1", actionType: "im_in", reasons: null, freeText: null },
        ["live-music"]
      );
      expect(result.accepted).toBe(true);
      expect(result.personaUpdated).toBe(true);
      expect(result.feedStale).toBe(true);
    });

    it("accepts a pass action", async () => {
      const result = await processAction(
        "user-001",
        { recommendationId: "rec-1", actionType: "pass", reasons: ["not interested"], freeText: null },
        ["karaoke"]
      );
      expect(result.accepted).toBe(true);
      expect(result.personaUpdated).toBe(true);
    });

    it("appends event to persona_events table", async () => {
      await processAction(
        "user-001",
        { recommendationId: "rec-1", actionType: "maybe", reasons: null, freeText: null },
        []
      );
      const events = getTableData("persona_events");
      expect(events).toBeDefined();
      expect(events!.length).toBeGreaterThanOrEqual(1);
      const last = events![events!.length - 1];
      expect(last.type).toBe("action");
      expect(last.user_id).toBe("user-001");
    });

    it("updates persona_snapshots after action", async () => {
      await processAction(
        "user-001",
        { recommendationId: "rec-1", actionType: "im_in", reasons: null, freeText: null },
        ["hiking"]
      );
      const snaps = getTableData("persona_snapshots");
      expect(snaps).toBeDefined();
      expect(snaps!.length).toBe(1);
      expect(snaps![0].user_id).toBe("user-001");
    });
  });

  describe("shouldPromoteHardFilter()", () => {
    it("returns true when negative score exceeds threshold", () => {
      const snapshot = {
        preferences: { pillar: {}, tags: { sushi: -0.8 } },
        hardFilters: [],
      } as any;
      expect(shouldPromoteHardFilter(snapshot, "sushi")).toBe(true);
    });

    it("returns false when score is above threshold", () => {
      const snapshot = {
        preferences: { pillar: {}, tags: { sushi: -0.1 } },
        hardFilters: [],
      } as any;
      expect(shouldPromoteHardFilter(snapshot, "sushi")).toBe(false);
    });

    it("returns false when tag has no score", () => {
      const snapshot = {
        preferences: { pillar: {}, tags: {} },
        hardFilters: [],
      } as any;
      expect(shouldPromoteHardFilter(snapshot, "unknown")).toBe(false);
    });
  });

  describe("getPersonaView()", () => {
    it("returns default persona for new user", async () => {
      const view = await getPersonaView("new-user");
      expect(view.projections).toEqual([]);
      expect(view.hardFilters).toEqual([]);
      expect(view.boostState.completed).toBe(false);
      expect(view.boostState.skipped).toBe(false);
    });

    it("returns stored persona data", async () => {
      seedTable("persona_snapshots", [{
        id: "user-001",
        user_id: "user-001",
        version: 1,
        preferences: { pillar: {}, tags: {} },
        hard_filters: [{ id: "hf1", category: "nightlife", label: "No nightlife", active: true, promotedFrom: null }],
        cadence_state: { answeredCount: 0, ignoredCount: 0, currentRate: 1, lastUpdatedAt: "" },
        learning_budget: { usedThisPeriod: 0, periodStart: "", periodEnd: "" },
        boost_state: { completed: true, skipped: false, startedAt: "2026-01-01", completedAt: "2026-01-01" },
        travel_state: { isAway: false, currentLocation: null, homeLocation: { lat: 47.6, lng: -122.3 } },
        plain_language_projections: [{ id: "p1", category: "food", statement: "Likes sushi", confidence: "high", editable: true }],
        last_event_sequence: 5,
        rebuilt_at: "2026-01-01",
        updated_at: "2026-01-01",
      }]);
      const view = await getPersonaView("user-001");
      expect(view.projections).toHaveLength(1);
      expect(view.projections[0].statement).toBe("Likes sushi");
      expect(view.hardFilters).toHaveLength(1);
      expect(view.boostState.completed).toBe(true);
    });
  });

  describe("applyPersonaEdits()", () => {
    it("returns updated=false when no edits applied", async () => {
      const result = await applyPersonaEdits("user-001", [], []);
      expect(result.updated).toBe(false);
      expect(Array.isArray(result.projections)).toBe(true);
    });

    it("toggles hard filter active state", async () => {
      seedTable("persona_snapshots", [{
        id: "user-001",
        user_id: "user-001",
        version: 1,
        preferences: { pillar: {}, tags: {} },
        hard_filters: [{ id: "hf1", category: "nightlife", label: "No nightlife", active: true, promotedFrom: null, createdAt: "" }],
        cadence_state: { answeredCount: 0, ignoredCount: 0, currentRate: 1, lastUpdatedAt: "" },
        learning_budget: { usedThisPeriod: 0, periodStart: "", periodEnd: "" },
        boost_state: { completed: false, skipped: false, startedAt: null, completedAt: null },
        travel_state: { isAway: false, currentLocation: null, homeLocation: { lat: 47.6, lng: -122.3 } },
        plain_language_projections: [],
        last_event_sequence: 0,
        rebuilt_at: "2026-01-01",
        updated_at: "2026-01-01",
      }]);
      const result = await applyPersonaEdits(
        "user-001",
        [],
        [{ filterId: "hf1", active: false }]
      );
      expect(result.updated).toBe(true);
      expect(result.feedStale).toBe(true);
    });
  });
});
