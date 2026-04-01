import { describe, it, expect, beforeEach } from "vitest";
import { processAction, shouldPromoteHardFilter, getPersonaView, applyPersonaEdits } from "../../../../insforge/functions/_shared/feedback-service.ts";
import { seedTable, getTableData, resetMock } from "../../mocks/insforge-sdk.ts";

beforeEach(() => resetMock());

describe("C4: hard-filter promotion", () => {
  it("accumulating negative score past threshold auto-adds a hard filter", async () => {
    const userId = "hf-user";
    for (let i = 0; i < 8; i++) {
      await processAction(
        userId,
        { recommendationId: `rec-${i}`, actionType: "pass", reasons: null, freeText: null },
        ["karaoke"]
      );
    }
    const snaps = getTableData("persona_snapshots");
    expect(snaps).toBeDefined();
    const snap = snaps![snaps!.length - 1];
    const filters = snap.hard_filters as Array<Record<string, unknown>>;
    const karaoke = filters.find((f) => f.category === "karaoke");
    if (karaoke) {
      expect(karaoke.active).toBe(true);
      expect(karaoke.promotedFrom).toBe("negative_signal");
    }
  });

  it("shouldPromoteHardFilter returns true when score exceeds threshold", () => {
    const snap = { preferences: { pillar: {}, tags: { loud: -0.8 } }, hardFilters: [] } as any;
    expect(shouldPromoteHardFilter(snap, "loud")).toBe(true);
  });

  it("shouldPromoteHardFilter returns false for mild negative", () => {
    const snap = { preferences: { pillar: {}, tags: { meh: -0.1 } }, hardFilters: [] } as any;
    expect(shouldPromoteHardFilter(snap, "meh")).toBe(false);
  });

  it("promoted filter is visible in persona view", async () => {
    seedTable("persona_snapshots", [{
      id: "hf-view-user",
      user_id: "hf-view-user",
      version: 1,
      preferences: { pillar: {}, tags: {} },
      hard_filters: [{ id: "hf1", category: "karaoke", label: "Auto-filtered: karaoke", active: true, promotedFrom: "negative_signal", createdAt: "" }],
      cadence_state: { answeredCount: 0, ignoredCount: 0, currentRate: 1, lastUpdatedAt: "" },
      learning_budget: { usedThisPeriod: 0, standaloneCount: 0, attachedCount: 0, periodStart: "", periodEnd: "" },
      boost_state: { completed: false, skipped: false, startedAt: null, completedAt: null },
      travel_state: { isAway: false, currentLocation: null, homeLocation: { lat: 47.6, lng: -122.3 } },
      plain_language_projections: [],
      last_event_sequence: 0,
      rebuilt_at: "",
      updated_at: "",
    }]);
    const view = await getPersonaView("hf-view-user");
    expect(view.hardFilters).toHaveLength(1);
    expect(view.hardFilters[0].active).toBe(true);
    expect(view.hardFilters[0].promotedFrom).toBe("negative_signal");
  });

  it("promoted filter can be toggled off via applyPersonaEdits", async () => {
    seedTable("persona_snapshots", [{
      id: "hf-toggle-user",
      user_id: "hf-toggle-user",
      version: 1,
      preferences: { pillar: {}, tags: {} },
      hard_filters: [{ id: "hf1", category: "karaoke", label: "Auto-filtered: karaoke", active: true, promotedFrom: "negative_signal", createdAt: "" }],
      cadence_state: { answeredCount: 0, ignoredCount: 0, currentRate: 1, lastUpdatedAt: "" },
      learning_budget: { usedThisPeriod: 0, standaloneCount: 0, attachedCount: 0, periodStart: "", periodEnd: "" },
      boost_state: { completed: false, skipped: false, startedAt: null, completedAt: null },
      travel_state: { isAway: false, currentLocation: null, homeLocation: { lat: 47.6, lng: -122.3 } },
      plain_language_projections: [],
      last_event_sequence: 0,
      rebuilt_at: "",
      updated_at: "",
    }]);
    const result = await applyPersonaEdits("hf-toggle-user", [], [{ filterId: "hf1", active: false }]);
    expect(result.updated).toBe(true);
  });
});
