import { describe, it, expect, beforeEach } from "vitest";
import { ingestAnswer } from "../../../../insforge/functions/_shared/learning-service.ts";
import { seedTable, getTableData, resetMock } from "../../mocks/insforge-sdk.ts";

beforeEach(() => resetMock());

const COMPARATIVE_QUESTION = {
  id: "q-comp",
  topic_family: "food",
  question_text: "Sushi or pizza?",
  expected_lift: 0.8,
  confidence_gap: 0.5,
  channel_eligibility: ["in_app_chat"],
  answer_schema: { type: "comparison" },
  is_comparative: true,
  comparison_items: { a: "sushi", b: "pizza" },
  source_type: "template",
  sensitive_topic_flag: false,
  created_at: "2026-01-01T00:00:00Z",
  expires_at: null,
};

const NON_COMPARATIVE_QUESTION = {
  ...COMPARATIVE_QUESTION,
  id: "q-plain",
  is_comparative: false,
  comparison_items: null,
};

describe("C4: comparative question mapping", () => {
  it("selecting 'a' boosts winner (sushi) by +0.15", async () => {
    seedTable("learning_questions", [COMPARATIVE_QUESTION]);
    await ingestAnswer("user-comp", {
      questionId: "q-comp",
      answer: { selected: "a" },
      sourceSurface: "in_app_chat",
      linkedRecommendationId: null,
    });
    const snaps = getTableData("persona_snapshots");
    expect(snaps).toBeDefined();
    const snap = snaps![snaps!.length - 1];
    const prefs = snap.preferences as { tags: Record<string, number> };
    expect(prefs.tags["sushi"]).toBeGreaterThanOrEqual(0.15);
  });

  it("selecting 'b' boosts winner (pizza) by +0.15", async () => {
    seedTable("learning_questions", [COMPARATIVE_QUESTION]);
    await ingestAnswer("user-comp2", {
      questionId: "q-comp",
      answer: { selected: "b" },
      sourceSurface: "in_app_chat",
      linkedRecommendationId: null,
    });
    const snaps = getTableData("persona_snapshots");
    const snap = snaps![snaps!.length - 1];
    const prefs = snap.preferences as { tags: Record<string, number> };
    expect(prefs.tags["pizza"]).toBeGreaterThanOrEqual(0.15);
  });

  it("loser tag score is unchanged (no false negative)", async () => {
    seedTable("learning_questions", [COMPARATIVE_QUESTION]);
    await ingestAnswer("user-comp3", {
      questionId: "q-comp",
      answer: { selected: "a" },
      sourceSurface: "in_app_chat",
      linkedRecommendationId: null,
    });
    const snaps = getTableData("persona_snapshots");
    const snap = snaps![snaps!.length - 1];
    const prefs = snap.preferences as { tags: Record<string, number> };
    expect(prefs.tags["pizza"] ?? 0).toBe(0);
  });

  it("non-comparative question does not apply boost", async () => {
    seedTable("learning_questions", [NON_COMPARATIVE_QUESTION]);
    await ingestAnswer("user-noncomp", {
      questionId: "q-plain",
      answer: { selected: "something" },
      sourceSurface: "push",
      linkedRecommendationId: null,
    });
    const snaps = getTableData("persona_snapshots");
    const snap = snaps![snaps!.length - 1];
    const prefs = snap.preferences as { tags: Record<string, number> };
    expect(prefs.tags["sushi"] ?? 0).toBe(0);
    expect(prefs.tags["pizza"] ?? 0).toBe(0);
  });
});
