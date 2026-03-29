import { describe, it, expect, beforeEach } from "vitest";
import {
  appendEvent,
  getEvents,
  getLatestSequence,
} from "../../../../insforge/functions/_shared/persona-event-store.ts";
import { seedTable, getTableData, resetMock, setMockUser } from "../../mocks/insforge-sdk.ts";

const USER_ID = "user-a3-001";

beforeEach(() => resetMock());

describe("persona-event-store", () => {
  describe("appendEvent()", () => {
    it("inserts an event row into persona_events", async () => {
      const event = {
        id: "evt-001",
        userId: USER_ID,
        type: "action" as const,
        version: 1,
        payload: {
          type: "action" as const,
          actionType: "im_in" as const,
          itemId: "item-001",
          reasons: null,
          freeText: null,
        },
        source: { surface: "feed", sessionId: "sess-1" },
        timestamp: new Date().toISOString(),
        sequenceNumber: 0,
      };
      const result = await appendEvent(event);
      expect(result.error).toBeNull();
      const rows = getTableData("persona_events");
      expect(rows).toHaveLength(1);
      expect(rows![0].id).toBe("evt-001");
    });

    it("auto-increments sequence based on existing events", async () => {
      seedTable("persona_events", [
        { id: "old", user_id: USER_ID, sequence_number: 5, type: "action" },
      ]);
      const event = {
        id: "evt-002",
        userId: USER_ID,
        type: "action" as const,
        version: 1,
        payload: {
          type: "action" as const,
          actionType: "pass" as const,
          itemId: "item-002",
          reasons: null,
          freeText: null,
        },
        source: { surface: "feed", sessionId: null },
        timestamp: new Date().toISOString(),
        sequenceNumber: -1,
      };
      const result = await appendEvent(event);
      expect(result.error).toBeNull();
      const rows = getTableData("persona_events")!;
      const inserted = rows.find((r: any) => r.id === "evt-002");
      expect(inserted).toBeDefined();
      expect(inserted!.sequence_number).toBe(6);
    });
  });

  describe("getEvents()", () => {
    it("returns events for a user ordered by sequence", async () => {
      seedTable("persona_events", [
        { id: "e1", user_id: USER_ID, sequence_number: 2, type: "action" },
        { id: "e0", user_id: USER_ID, sequence_number: 1, type: "action" },
        { id: "e3", user_id: "other-user", sequence_number: 1, type: "action" },
      ]);
      const events = await getEvents(USER_ID);
      expect(events).toHaveLength(2);
      expect(events[0].id).toBe("e0");
      expect(events[1].id).toBe("e1");
    });

    it("returns events after a given sequence number", async () => {
      seedTable("persona_events", [
        { id: "e1", user_id: USER_ID, sequence_number: 1, type: "action" },
        { id: "e2", user_id: USER_ID, sequence_number: 2, type: "action" },
        { id: "e3", user_id: USER_ID, sequence_number: 3, type: "action" },
      ]);
      const events = await getEvents(USER_ID, { afterSequence: 1 });
      expect(events).toHaveLength(2);
      expect(events[0].id).toBe("e2");
    });

    it("returns empty array when no events exist", async () => {
      seedTable("persona_events", []);
      const events = await getEvents(USER_ID);
      expect(events).toEqual([]);
    });
  });

  describe("getLatestSequence()", () => {
    it("returns the highest sequence number for a user", async () => {
      seedTable("persona_events", [
        { id: "e1", user_id: USER_ID, sequence_number: 3, type: "action" },
        { id: "e2", user_id: USER_ID, sequence_number: 7, type: "action" },
      ]);
      const seq = await getLatestSequence(USER_ID);
      expect(seq).toBe(7);
    });

    it("returns 0 when no events exist", async () => {
      seedTable("persona_events", []);
      const seq = await getLatestSequence(USER_ID);
      expect(seq).toBe(0);
    });
  });
});
