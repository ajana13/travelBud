import { describe, it, expect } from "vitest";
import { getSeattleSeedItems } from "../../../../insforge/functions/_shared/inventory/seed-data.ts";

describe("seed-data", () => {
  it("returns exactly 30 seed items", () => {
    const items = getSeattleSeedItems();
    expect(items).toHaveLength(30);
  });

  it("has 10 events, 10 dining, 10 outdoors", () => {
    const items = getSeattleSeedItems();
    const events = items.filter((i) => i.pillar === "events");
    const dining = items.filter((i) => i.pillar === "dining");
    const outdoors = items.filter((i) => i.pillar === "outdoors");
    expect(events).toHaveLength(10);
    expect(dining).toHaveLength(10);
    expect(outdoors).toHaveLength(10);
  });

  it("all items have Seattle-area coordinates", () => {
    const items = getSeattleSeedItems();
    for (const item of items) {
      expect(item.location.lat).toBeGreaterThan(47.4);
      expect(item.location.lat).toBeLessThan(47.8);
      expect(item.location.lng).toBeGreaterThan(-122.5);
      expect(item.location.lng).toBeLessThan(-122.1);
    }
  });

  it("all items have required fields", () => {
    const items = getSeattleSeedItems();
    for (const item of items) {
      expect(item.id).toBeDefined();
      expect(item.title).toBeDefined();
      expect(item.sourceProvider).toBeDefined();
      expect(item.tags.length).toBeGreaterThan(0);
      expect(item.deepLink).toMatch(/^https?:\/\//);
      expect(item.active).toBe(true);
    }
  });

  it("all items have unique IDs", () => {
    const items = getSeattleSeedItems();
    const ids = items.map((i) => i.id);
    expect(new Set(ids).size).toBe(30);
  });
});
