import { describe, it, expect, beforeEach } from "vitest";
import {
  upsertInventoryItems,
  deactivateStaleItems,
} from "../../../../insforge/functions/_shared/inventory/inventory-pipeline.ts";
import { seedTable, getTableData, resetMock } from "../../mocks/insforge-sdk.ts";

beforeEach(() => resetMock());

describe("inventory-pipeline", () => {
  describe("upsertInventoryItems()", () => {
    it("inserts new items into inventory_items table", async () => {
      const items = [
        { id: "i1", source_id: "s1", source_provider: "mock-events", title: "Event 1", active: true },
        { id: "i2", source_id: "s2", source_provider: "mock-events", title: "Event 2", active: true },
      ];
      const result = await upsertInventoryItems(items);
      expect(result.error).toBeNull();
      expect(result.upserted).toBe(2);
      const rows = getTableData("inventory_items");
      expect(rows).toHaveLength(2);
    });

    it("updates existing items by id", async () => {
      seedTable("inventory_items", [
        { id: "i1", source_id: "s1", source_provider: "mock", title: "Old Title", active: true },
      ]);
      const result = await upsertInventoryItems([
        { id: "i1", source_id: "s1", source_provider: "mock", title: "New Title", active: true },
      ]);
      expect(result.error).toBeNull();
      const rows = getTableData("inventory_items")!;
      expect(rows.find((r: any) => r.id === "i1")!.title).toBe("New Title");
    });
  });

  describe("deactivateStaleItems()", () => {
    it("marks items not in active set as inactive", async () => {
      seedTable("inventory_items", [
        { id: "i1", source_provider: "mock", active: true },
        { id: "i2", source_provider: "mock", active: true },
        { id: "i3", source_provider: "mock", active: true },
      ]);
      const result = await deactivateStaleItems("mock", ["i1", "i3"]);
      expect(result.deactivated).toBe(1);
      const rows = getTableData("inventory_items")!;
      expect(rows.find((r: any) => r.id === "i2")!.active).toBe(false);
    });
  });
});
