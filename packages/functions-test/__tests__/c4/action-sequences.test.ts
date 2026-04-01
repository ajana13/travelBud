import { describe, it, expect } from "vitest";
import { replayActionSequence, assertTagScore } from "./fixtures.ts";

const USER = "seq-user";

describe("C4: action sequence replay", () => {
  it("contradiction sequence: im_in -> pass -> im_in on same tag", () => {
    const snap = replayActionSequence(USER, [
      { actionType: "im_in", tags: ["music"] },
      { actionType: "pass", tags: ["music"] },
      { actionType: "im_in", tags: ["music"] },
    ]);
    assertTagScore(snap, "music", "positive");
  });

  it("repeated pass accumulates negative score", () => {
    const snap = replayActionSequence(USER, [
      { actionType: "pass", tags: ["karaoke"] },
      { actionType: "pass", tags: ["karaoke"] },
      { actionType: "pass", tags: ["karaoke"] },
      { actionType: "pass", tags: ["karaoke"] },
      { actionType: "pass", tags: ["karaoke"] },
    ]);
    assertTagScore(snap, "karaoke", "negative");
    expect(snap.preferences.tags["karaoke"]).toBeLessThan(-0.3);
  });

  it("maybe -> pass -> cant on same tag: relative weights", () => {
    const snap = replayActionSequence(USER, [
      { actionType: "maybe", tags: ["trivia"] },
      { actionType: "pass", tags: ["trivia"] },
      { actionType: "cant", tags: ["trivia"] },
    ]);
    // maybe: +0.1, pass: -0.15 (discounted since abs(0.1) < 0.3 after maybe... but 0.1>0 triggers contradiction path => -0.225), cant: 0
    // Net should be negative
    assertTagScore(snap, "trivia", "negative");
  });

  it("interleaved actions across 3 pillars track independently", () => {
    const snap = replayActionSequence(USER, [
      { actionType: "im_in", tags: ["music"] },
      { actionType: "im_in", tags: ["sushi"] },
      { actionType: "pass", tags: ["hiking"] },
      { actionType: "im_in", tags: ["music"] },
      { actionType: "pass", tags: ["sushi"] },
    ]);
    assertTagScore(snap, "music", "positive");
    expect(snap.preferences.tags["music"]).toBeGreaterThan(snap.preferences.tags["sushi"]!);
    assertTagScore(snap, "hiking", "negative");
  });

  it("10-step evolution shows drift over time", () => {
    const snap = replayActionSequence(USER, [
      { actionType: "im_in", tags: ["jazz"] },
      { actionType: "im_in", tags: ["jazz"] },
      { actionType: "im_in", tags: ["jazz"] },
      { actionType: "pass", tags: ["jazz"] },
      { actionType: "pass", tags: ["jazz"] },
      { actionType: "im_in", tags: ["jazz"] },
      { actionType: "im_in", tags: ["jazz"] },
      { actionType: "pass", tags: ["jazz"] },
      { actionType: "maybe", tags: ["jazz"] },
      { actionType: "im_in", tags: ["jazz"] },
    ]);
    assertTagScore(snap, "jazz", "positive");
  });
});
