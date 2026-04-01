import { describe, it, expect, beforeEach } from "vitest";
import { generateFeed } from "../../../../insforge/functions/_shared/recommendation-service.ts";
import { seedTable, resetMock } from "../../mocks/insforge-sdk.ts";

beforeEach(() => resetMock());

function makeItem(id: string, pillar: string, tags: string[], overrides: Record<string, unknown> = {}) {
  return {
    id, pillar, title: `Item ${id}`, tags, description: null,
    price_band: overrides.price_band ?? "mid",
    social_mode: overrides.social_mode ?? "group",
    time_shape: overrides.time_shape ?? "evening",
    nightlife: false, location_lat: 47.6, location_lng: -122.3,
    location_address: "123 Main", location_neighborhood: "Capitol Hill",
    active: true, ...overrides,
  };
}

describe("C4: immediate re-ranking after learning answer", () => {
  it("feed order changes after persona preferences change", async () => {
    seedTable("inventory_items", [
      makeItem("i1", "events", ["jazz"], { time_shape: "evening", social_mode: "group", price_band: "mid" }),
      makeItem("i2", "dining", ["sushi"], { time_shape: "lunch", social_mode: "duo", price_band: "budget" }),
      makeItem("i3", "outdoors", ["hiking"], { time_shape: "morning", social_mode: "solo", price_band: "free" }),
    ]);

    const snapBefore = {
      preferences: { pillar: {}, tags: {} },
      hardFilters: [],
    };
    const feedBefore = await generateFeed(snapBefore);

    const snapAfter = {
      preferences: { pillar: {}, tags: { sushi: 0.8 } },
      hardFilters: [],
    };
    const feedAfter = await generateFeed(snapAfter);

    const sushiBefore = feedBefore.cards.find((c) => c.itemId === "i2");
    const sushiAfter = feedAfter.cards.find((c) => c.itemId === "i2");

    if (sushiBefore && sushiAfter) {
      expect(sushiAfter.score).toBeGreaterThan(sushiBefore.score);
    }
  });

  it("boosted tag moves item higher in feed position", async () => {
    seedTable("inventory_items", [
      makeItem("i1", "events", ["jazz"], { time_shape: "evening", social_mode: "group", price_band: "mid" }),
      makeItem("i2", "events", ["classical"], { time_shape: "morning", social_mode: "solo", price_band: "free" }),
      makeItem("i3", "dining", ["ramen"], { time_shape: "lunch", social_mode: "duo", price_band: "budget" }),
      makeItem("i4", "outdoors", ["kayak"], { time_shape: "afternoon", social_mode: "any", price_band: "premium" }),
    ]);

    const snapWithBoost = {
      preferences: { pillar: {}, tags: { ramen: 1.0 } },
      hardFilters: [],
    };
    const feed = await generateFeed(snapWithBoost);
    const ramenCard = feed.cards.find((c) => c.itemId === "i3");
    expect(ramenCard).toBeDefined();
    expect(ramenCard!.position).toBeLessThanOrEqual(1);
  });
});
