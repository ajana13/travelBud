import { describe, it, expect, beforeEach } from "vitest";
import {
  getSnapshot,
  upsertSnapshot,
  createDefaultSnapshot,
} from "../../../../insforge/functions/_shared/persona-snapshot-store.ts";
import { seedTable, getTableData, resetMock } from "../../mocks/insforge-sdk.ts";

const USER_ID = "user-snap-001";

beforeEach(() => resetMock());

describe("persona-snapshot-store", () => {
  describe("createDefaultSnapshot()", () => {
    it("returns a blank snapshot for the given user", () => {
      const snap = createDefaultSnapshot(USER_ID);
      expect(snap.userId).toBe(USER_ID);
      expect(snap.version).toBe(1);
      expect(snap.lastEventSequence).toBe(0);
      expect(snap.preferences.pillar).toEqual({});
      expect(snap.preferences.tags).toEqual({});
      expect(snap.hardFilters).toEqual([]);
      expect(snap.plainLanguageProjections).toEqual([]);
    });
  });

  describe("getSnapshot()", () => {
    it("returns snapshot when one exists", async () => {
      seedTable("persona_snapshots", [
        {
          user_id: USER_ID,
          version: 2,
          preferences: { pillar: { events: 0.8 }, tags: {} },
          hard_filters: [],
          cadence_state: { answeredCount: 5, ignoredCount: 0, currentRate: 1, lastUpdatedAt: "t" },
          learning_budget: { usedThisPeriod: 1, periodStart: "s", periodEnd: "e" },
          boost_state: { completed: false, skipped: false, startedAt: null, completedAt: null },
          travel_state: { isAway: false, currentLocation: null, homeLocation: { lat: 47.6, lng: -122.3 } },
          plain_language_projections: [],
          last_event_sequence: 10,
          rebuilt_at: "t",
          updated_at: "t",
        },
      ]);
      const snap = await getSnapshot(USER_ID);
      expect(snap).not.toBeNull();
      expect(snap!.userId).toBe(USER_ID);
      expect(snap!.version).toBe(2);
      expect(snap!.lastEventSequence).toBe(10);
    });

    it("returns null when no snapshot exists", async () => {
      seedTable("persona_snapshots", []);
      const snap = await getSnapshot(USER_ID);
      expect(snap).toBeNull();
    });
  });

  describe("upsertSnapshot()", () => {
    it("creates a new snapshot row", async () => {
      const snap = createDefaultSnapshot(USER_ID);
      const result = await upsertSnapshot(snap);
      expect(result.error).toBeNull();
      const rows = getTableData("persona_snapshots");
      expect(rows).toHaveLength(1);
    });

    it("updates existing snapshot", async () => {
      seedTable("persona_snapshots", [
        {
          id: USER_ID,
          user_id: USER_ID,
          version: 1,
          last_event_sequence: 0,
        },
      ]);
      const snap = createDefaultSnapshot(USER_ID);
      snap.version = 3;
      snap.lastEventSequence = 15;
      const result = await upsertSnapshot(snap);
      expect(result.error).toBeNull();
    });
  });
});
