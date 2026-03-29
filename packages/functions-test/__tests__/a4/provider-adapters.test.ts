import { describe, it, expect } from "vitest";
import {
  type ProviderAdapter,
  createMockEventsAdapter,
  createMockDiningAdapter,
  createMockOutdoorsAdapter,
} from "../../../../insforge/functions/_shared/inventory/provider-adapters.ts";

describe("provider-adapters", () => {
  describe("ProviderAdapter interface compliance", () => {
    const adapters: Array<{ name: string; adapter: ProviderAdapter }> = [
      { name: "events", adapter: createMockEventsAdapter() },
      { name: "dining", adapter: createMockDiningAdapter() },
      { name: "outdoors", adapter: createMockOutdoorsAdapter() },
    ];

    for (const { name, adapter } of adapters) {
      describe(`${name} adapter`, () => {
        it("has a provider name", () => {
          expect(typeof adapter.providerName).toBe("string");
          expect(adapter.providerName.length).toBeGreaterThan(0);
        });

        it("fetchItems returns an array of raw items", async () => {
          const items = await adapter.fetchItems();
          expect(Array.isArray(items)).toBe(true);
          expect(items.length).toBeGreaterThan(0);
        });

        it("transform converts raw items to normalized inventory items", async () => {
          const raw = await adapter.fetchItems();
          const normalized = raw.map((r) => adapter.transform(r));
          for (const item of normalized) {
            expect(item.id).toBeDefined();
            expect(item.sourceProvider).toBe(adapter.providerName);
            expect(item.title).toBeDefined();
            expect(["events", "dining", "outdoors"]).toContain(item.pillar);
            expect(item.location).toBeDefined();
            expect(item.location.lat).toBeDefined();
            expect(item.location.lng).toBeDefined();
          }
        });

        it("validate returns true for well-formed items", async () => {
          const raw = await adapter.fetchItems();
          const normalized = raw.map((r) => adapter.transform(r));
          for (const item of normalized) {
            expect(adapter.validate(item)).toBe(true);
          }
        });

        it("dedupeKey returns a unique string", async () => {
          const raw = await adapter.fetchItems();
          const normalized = raw.map((r) => adapter.transform(r));
          const keys = normalized.map((i) => adapter.dedupeKey(i));
          expect(new Set(keys).size).toBe(keys.length);
        });
      });
    }
  });
});
