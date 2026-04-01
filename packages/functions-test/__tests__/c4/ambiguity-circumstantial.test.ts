import { describe, it, expect } from "vitest";
import { applyAction } from "../../../../insforge/functions/_shared/persona-replay-engine.ts";
import { createDefaultSnapshot } from "./fixtures.ts";

const USER = "ambiguity-user";

describe("C4: ambiguity-first and circumstantial", () => {
  it("pass on tag with no prior signal applies discounted negative", () => {
    const snap = createDefaultSnapshot(USER);
    const result = applyAction(
      snap,
      { type: "action", actionType: "pass", itemId: "i1", reasons: null, freeText: null },
      { tags: ["unknown-tag"] }
    );
    const score = result.preferences.tags["unknown-tag"];
    expect(score).toBeLessThan(0);
    expect(score).toBeGreaterThan(-0.15);
  });

  it("pass on tag with strong positive applies amplified negative (contradiction)", () => {
    const snap = createDefaultSnapshot(USER);
    snap.preferences.tags = { loved: 0.8 };
    const result = applyAction(
      snap,
      { type: "action", actionType: "pass", itemId: "i1", reasons: null, freeText: null },
      { tags: ["loved"] }
    );
    const delta = result.preferences.tags["loved"] - 0.8;
    expect(delta).toBeLessThan(-0.2);
  });

  it("pass on tag with existing negative applies discounted weight (low confidence)", () => {
    const snap = createDefaultSnapshot(USER);
    snap.preferences.tags = { meh: -0.1 };
    const result = applyAction(
      snap,
      { type: "action", actionType: "pass", itemId: "i1", reasons: null, freeText: null },
      { tags: ["meh"] }
    );
    const delta = result.preferences.tags["meh"] - (-0.1);
    expect(delta).toBeGreaterThan(-0.15);
    expect(delta).toBeLessThan(0);
  });

  it("cant on any tag applies zero weight change", () => {
    const snap = createDefaultSnapshot(USER);
    snap.preferences.tags = { concerts: 0.5 };
    const result = applyAction(
      snap,
      { type: "action", actionType: "cant", itemId: "i1", reasons: null, freeText: null },
      { tags: ["concerts"] }
    );
    expect(result.preferences.tags["concerts"]).toBe(0.5);
  });

  it("cant does not affect tags with no prior signal", () => {
    const snap = createDefaultSnapshot(USER);
    const result = applyAction(
      snap,
      { type: "action", actionType: "cant", itemId: "i1", reasons: null, freeText: null },
      { tags: ["fresh-tag"] }
    );
    expect(result.preferences.tags["fresh-tag"]).toBe(0);
  });

  it("repeated cant does not accumulate negative score", () => {
    let snap = createDefaultSnapshot(USER);
    for (let i = 0; i < 10; i++) {
      snap = applyAction(
        snap,
        { type: "action", actionType: "cant", itemId: `i${i}`, reasons: null, freeText: null },
        { tags: ["movies"] }
      );
    }
    expect(snap.preferences.tags["movies"]).toBe(0);
  });
});
