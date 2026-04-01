import { describe, it, expect, beforeEach } from "vitest";
import {
  applyHardFilters,
  scoreCandidate,
  applyExploration,
  applyDiversity,
  assignConfidenceLabel,
  buildExplanationFacts,
  buildExplanationText,
  generateFeed,
} from "../../../../insforge/functions/_shared/recommendation-service.ts";
import { seedTable, resetMock } from "../../mocks/insforge-sdk.ts";

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeItem(overrides: Record<string, unknown> = {}) {
  return {
    id: overrides.id ?? "item-1",
    pillar: overrides.pillar ?? "events",
    title: overrides.title ?? "Test Event",
    description: null,
    tags: overrides.tags ?? ["live-music", "outdoor"],
    price_band: overrides.price_band ?? "mid",
    social_mode: overrides.social_mode ?? "group",
    time_shape: overrides.time_shape ?? "evening",
    nightlife: false,
    location_lat: 47.6,
    location_lng: -122.3,
    location_address: "123 Main St",
    location_neighborhood: overrides.location_neighborhood ?? "Capitol Hill",
    active: true,
    ...overrides,
  };
}

function makeSnapshot(overrides: Record<string, unknown> = {}) {
  return {
    preferences: (overrides.preferences as any) ?? {
      pillar: {},
      tags: {},
    },
    hardFilters: (overrides.hardFilters as any) ?? [],
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

beforeEach(() => resetMock());

describe("recommendation-service", () => {
  describe("applyHardFilters()", () => {
    it("returns all items when no active hard filters", () => {
      const items = [makeItem(), makeItem({ id: "item-2" })];
      const snap = makeSnapshot();
      const result = applyHardFilters(items as any, snap);
      expect(result).toHaveLength(2);
    });

    it("removes items matching a pillar hard filter", () => {
      const items = [
        makeItem({ id: "e1", pillar: "events" }),
        makeItem({ id: "d1", pillar: "dining" }),
      ];
      const snap = makeSnapshot({
        hardFilters: [
          { id: "hf1", category: "events", label: "No Events", active: true },
        ],
      });
      const result = applyHardFilters(items as any, snap);
      expect(result).toHaveLength(1);
      expect(result[0].pillar).toBe("dining");
    });

    it("removes items matching a tag hard filter", () => {
      const items = [
        makeItem({ id: "i1", tags: ["sushi", "japanese"] }),
        makeItem({ id: "i2", tags: ["pizza", "italian"] }),
      ];
      const snap = makeSnapshot({
        hardFilters: [
          { id: "hf1", category: "sushi", label: "No Sushi", active: true },
        ],
      });
      const result = applyHardFilters(items as any, snap);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("i2");
    });

    it("ignores inactive hard filters", () => {
      const items = [makeItem({ pillar: "events" })];
      const snap = makeSnapshot({
        hardFilters: [
          { id: "hf1", category: "events", label: "No Events", active: false },
        ],
      });
      const result = applyHardFilters(items as any, snap);
      expect(result).toHaveLength(1);
    });
  });

  describe("scoreCandidate()", () => {
    it("scores 0 for empty preferences", () => {
      const item = makeItem({ tags: [] });
      const snap = makeSnapshot();
      const result = scoreCandidate(item as any, snap);
      expect(result.score).toBeCloseTo(0.1);
      expect(result.tagOverlap).toHaveLength(0);
    });

    it("scores positively for matching pillar", () => {
      const item = makeItem({ pillar: "events" });
      const snap = makeSnapshot({
        preferences: { pillar: { events: 0.8 }, tags: {} },
      });
      const result = scoreCandidate(item as any, snap);
      expect(result.score).toBeGreaterThan(0);
    });

    it("scores positively for matching tags", () => {
      const item = makeItem({ tags: ["live-music", "outdoor"] });
      const snap = makeSnapshot({
        preferences: { pillar: {}, tags: { "live-music": 0.5, "outdoor": 0.3 } },
      });
      const result = scoreCandidate(item as any, snap);
      expect(result.score).toBeGreaterThan(0);
      expect(result.tagOverlap).toContain("live-music");
      expect(result.tagOverlap).toContain("outdoor");
    });

    it("scores negatively for negative tag preferences", () => {
      const item = makeItem({ tags: ["karaoke"] });
      const snap = makeSnapshot({
        preferences: { pillar: {}, tags: { karaoke: -0.4 } },
      });
      const result = scoreCandidate(item as any, snap);
      expect(result.score).toBeLessThan(0);
    });
  });

  describe("applyExploration()", () => {
    it("returns exploited and explored sets", () => {
      const scored = Array.from({ length: 10 }, (_, i) => ({
        item: makeItem({ id: `item-${i}` }) as any,
        score: 1 - i * 0.1,
        tagOverlap: [],
      }));
      const { exploited, explored } = applyExploration(scored, 6);
      expect(exploited.length + explored.length).toBeLessThanOrEqual(6);
      expect(explored.length).toBeLessThanOrEqual(2);
    });

    it("returns no exploration when too few candidates", () => {
      const scored = [
        { item: makeItem({ id: "i1" }) as any, score: 1, tagOverlap: [] },
      ];
      const { exploited, explored } = applyExploration(scored, 3);
      expect(exploited.length).toBe(1);
      expect(explored.length).toBe(0);
    });
  });

  describe("applyDiversity()", () => {
    it("limits items per pillar", () => {
      const scored = [
        { item: makeItem({ id: "e1", pillar: "events", time_shape: "evening", social_mode: "group", price_band: "mid" }) as any, score: 0.9, tagOverlap: [] },
        { item: makeItem({ id: "e2", pillar: "events", time_shape: "morning", social_mode: "solo", price_band: "free" }) as any, score: 0.8, tagOverlap: [] },
        { item: makeItem({ id: "e3", pillar: "events", time_shape: "afternoon", social_mode: "duo", price_band: "budget" }) as any, score: 0.7, tagOverlap: [] },
        { item: makeItem({ id: "d1", pillar: "dining", time_shape: "lunch", social_mode: "any", price_band: "premium" }) as any, score: 0.6, tagOverlap: [] },
      ];
      const result = applyDiversity(scored, 2);
      const eventCount = result.filter((s) => s.item.pillar === "events").length;
      expect(eventCount).toBeLessThanOrEqual(2);
      expect(result.length).toBe(3);
    });

    it("limits items per time_shape", () => {
      const scored = [
        { item: makeItem({ id: "i1", pillar: "events", time_shape: "evening", social_mode: "group", price_band: "mid" }) as any, score: 0.9, tagOverlap: [] },
        { item: makeItem({ id: "i2", pillar: "dining", time_shape: "evening", social_mode: "solo", price_band: "free" }) as any, score: 0.8, tagOverlap: [] },
        { item: makeItem({ id: "i3", pillar: "outdoors", time_shape: "evening", social_mode: "duo", price_band: "budget" }) as any, score: 0.7, tagOverlap: [] },
      ];
      const result = applyDiversity(scored, 2);
      const eveningCount = result.filter((s) => s.item.time_shape === "evening").length;
      expect(eveningCount).toBeLessThanOrEqual(2);
    });
  });

  describe("assignConfidenceLabel()", () => {
    it("returns 'new' when no tag overlap", () => {
      expect(assignConfidenceLabel(0, [])).toBe("new");
    });

    it("returns 'strong_match' for high score with overlap", () => {
      expect(assignConfidenceLabel(0.6, ["tag1"])).toBe("strong_match");
    });

    it("returns 'learning' for moderate score with overlap", () => {
      expect(assignConfidenceLabel(0.3, ["tag1"])).toBe("learning");
    });
  });

  describe("buildExplanationFacts()", () => {
    it("includes pillar match fact when preference exists", () => {
      const item = makeItem({ pillar: "events" });
      const snap = makeSnapshot({
        preferences: { pillar: { events: 0.5 }, tags: {} },
      });
      const facts = buildExplanationFacts(item as any, snap, []);
      const pillarFact = facts.find((f) => f.factType === "pillar_match");
      expect(pillarFact).toBeDefined();
      expect(pillarFact!.contributes).toBe("positive");
    });

    it("includes tag match facts", () => {
      const item = makeItem({ tags: ["live-music"] });
      const snap = makeSnapshot({
        preferences: { pillar: {}, tags: { "live-music": 0.5 } },
      });
      const facts = buildExplanationFacts(item as any, snap, ["live-music"]);
      const tagFacts = facts.filter((f) => f.factType === "tag_match");
      expect(tagFacts).toHaveLength(1);
      expect(tagFacts[0].factValue).toBe("live-music");
    });

    it("always includes a location fact", () => {
      const item = makeItem();
      const snap = makeSnapshot();
      const facts = buildExplanationFacts(item as any, snap, []);
      const locFact = facts.find((f) => f.factType === "location");
      expect(locFact).toBeDefined();
    });
  });

  describe("buildExplanationText()", () => {
    it("returns default text when no positive facts", () => {
      const text = buildExplanationText([
        { factType: "location", factKey: "neighborhood", factValue: "Capitol Hill", contributes: "neutral" },
      ]);
      expect(text).toBe("Recommended for you");
    });

    it("joins positive reasons", () => {
      const text = buildExplanationText([
        { factType: "tag_match", factKey: "tag", factValue: "live-music", contributes: "positive" },
        { factType: "tag_match", factKey: "tag", factValue: "outdoor", contributes: "positive" },
      ]);
      expect(text).toContain("live-music");
      expect(text).toContain("outdoor");
    });
  });

  describe("generateFeed()", () => {
    it("returns cards from seeded inventory", async () => {
      seedTable("inventory_items", [
        makeItem({ id: "i1", pillar: "events", tags: ["music"] }),
        makeItem({ id: "i2", pillar: "dining", tags: ["sushi"] }),
        makeItem({ id: "i3", pillar: "outdoors", tags: ["hiking"] }),
        makeItem({ id: "i4", pillar: "events", tags: ["comedy"] }),
        makeItem({ id: "i5", pillar: "dining", tags: ["pizza"] }),
        makeItem({ id: "i6", pillar: "outdoors", tags: ["kayaking"] }),
      ]);
      const snap = makeSnapshot({
        preferences: { pillar: { events: 0.5 }, tags: { music: 0.3 } },
      });
      const result = await generateFeed(snap);
      expect(result.cards.length).toBeGreaterThanOrEqual(3);
      expect(result.cards.length).toBeLessThanOrEqual(8);
      expect(result.feedSize).toBe(result.cards.length);
      expect(result.explorationCount).toBeLessThanOrEqual(2);
      expect(result.generatedAt).toBeTruthy();
    });

    it("returns empty feed when no inventory", async () => {
      const snap = makeSnapshot();
      const result = await generateFeed(snap);
      expect(result.cards).toHaveLength(0);
      expect(result.feedSize).toBe(0);
    });

    it("each card has required fields", async () => {
      seedTable("inventory_items", [
        makeItem({ id: "i1", tags: ["music"] }),
        makeItem({ id: "i2", tags: ["food"] }),
        makeItem({ id: "i3", tags: ["hiking"] }),
      ]);
      const snap = makeSnapshot();
      const result = await generateFeed(snap);
      for (const card of result.cards) {
        expect(card.id).toBeTruthy();
        expect(card.itemId).toBeTruthy();
        expect(typeof card.score).toBe("number");
        expect(["new", "learning", "strong_match"]).toContain(card.confidenceLabel);
        expect(typeof card.isExploration).toBe("boolean");
        expect(Array.isArray(card.explanationFacts)).toBe(true);
        expect(typeof card.explanationText).toBe("string");
        expect(card.allowedActions).toEqual(["im_in", "maybe", "pass", "cant"]);
        expect(typeof card.position).toBe("number");
      }
    });

    it("filters out hard-filtered items", async () => {
      seedTable("inventory_items", [
        makeItem({ id: "i1", pillar: "events" }),
        makeItem({ id: "i2", pillar: "dining" }),
        makeItem({ id: "i3", pillar: "outdoors" }),
      ]);
      const snap = makeSnapshot({
        hardFilters: [
          { id: "hf1", category: "events", label: "No Events", active: true },
        ],
      });
      const result = await generateFeed(snap);
      const pillars = result.cards.map((c) => {
        const inv = [
          makeItem({ id: "i1", pillar: "events" }),
          makeItem({ id: "i2", pillar: "dining" }),
          makeItem({ id: "i3", pillar: "outdoors" }),
        ];
        const match = inv.find((i) => i.id === c.itemId);
        return match?.pillar;
      });
      expect(pillars).not.toContain("events");
    });
  });
});
