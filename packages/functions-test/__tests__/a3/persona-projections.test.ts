import { describe, it, expect } from "vitest";
import { generateProjections } from "../../../../insforge/functions/_shared/persona-projections.ts";
import { createDefaultSnapshot } from "../../../../insforge/functions/_shared/persona-snapshot-store.ts";

const USER_ID = "user-proj-001";

describe("persona-projections", () => {
  describe("generateProjections()", () => {
    it("returns empty projections for default snapshot", () => {
      const snap = createDefaultSnapshot(USER_ID);
      const projections = generateProjections(snap);
      expect(projections).toEqual([]);
    });

    it("generates projections from preference tags", () => {
      const snap = createDefaultSnapshot(USER_ID);
      snap.preferences.tags = { "live-music": 0.8, "craft-beer": 0.6 };
      const projections = generateProjections(snap);
      expect(projections.length).toBeGreaterThan(0);
      expect(projections.every((p) => p.id && p.category && p.statement)).toBe(true);
    });

    it("only generates projections for tags above threshold", () => {
      const snap = createDefaultSnapshot(USER_ID);
      snap.preferences.tags = { strong: 0.8, weak: 0.1 };
      const projections = generateProjections(snap);
      const ids = projections.map((p) => p.category);
      expect(ids).toContain("strong");
      expect(ids).not.toContain("weak");
    });

    it("marks all projections as editable", () => {
      const snap = createDefaultSnapshot(USER_ID);
      snap.preferences.tags = { food: 0.7 };
      const projections = generateProjections(snap);
      expect(projections.every((p) => p.editable)).toBe(true);
    });

    it("generates negative projections for strongly negative tags", () => {
      const snap = createDefaultSnapshot(USER_ID);
      snap.preferences.tags = { karaoke: -0.5, loud: -0.8 };
      const projections = generateProjections(snap);
      expect(projections).toHaveLength(2);
      expect(projections.every((p) => p.statement.startsWith("Tends to avoid"))).toBe(true);
    });

    it("ignores mildly negative tags", () => {
      const snap = createDefaultSnapshot(USER_ID);
      snap.preferences.tags = { meh: -0.1 };
      const projections = generateProjections(snap);
      expect(projections).toHaveLength(0);
    });
  });
});
