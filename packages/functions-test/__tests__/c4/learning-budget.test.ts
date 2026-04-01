import { describe, it, expect } from "vitest";
import { applyLearningAnswer } from "../../../../insforge/functions/_shared/persona-replay-engine.ts";
import { createDefaultSnapshot } from "./fixtures.ts";

const USER = "budget-user";

describe("C4: shared learning budget", () => {
  it("standalone answer increments standaloneCount", () => {
    const snap = createDefaultSnapshot(USER);
    const result = applyLearningAnswer(snap, {
      type: "learning_answer",
      questionId: "q1",
      answer: { selected: "a" },
      sourceSurface: "push",
      linkedRecommendationId: null,
    });
    expect(result.learningBudget.standaloneCount).toBe(1);
    expect(result.learningBudget.attachedCount).toBe(0);
    expect(result.learningBudget.usedThisPeriod).toBe(1);
  });

  it("in_app_chat answer increments standaloneCount", () => {
    const snap = createDefaultSnapshot(USER);
    const result = applyLearningAnswer(snap, {
      type: "learning_answer",
      questionId: "q1",
      answer: { selected: "b" },
      sourceSurface: "in_app_chat",
      linkedRecommendationId: null,
    });
    expect(result.learningBudget.standaloneCount).toBe(1);
    expect(result.learningBudget.attachedCount).toBe(0);
  });

  it("attached follow-up answer increments attachedCount", () => {
    const snap = createDefaultSnapshot(USER);
    const result = applyLearningAnswer(snap, {
      type: "learning_answer",
      questionId: "q1",
      answer: { selected: "a" },
      sourceSurface: "attached_follow_up",
      linkedRecommendationId: "rec-123",
    });
    expect(result.learningBudget.standaloneCount).toBe(0);
    expect(result.learningBudget.attachedCount).toBe(1);
    expect(result.learningBudget.usedThisPeriod).toBe(1);
  });

  it("both sources increment usedThisPeriod against shared cap", () => {
    let snap = createDefaultSnapshot(USER);
    snap = applyLearningAnswer(snap, {
      type: "learning_answer", questionId: "q1", answer: {}, sourceSurface: "push", linkedRecommendationId: null,
    });
    snap = applyLearningAnswer(snap, {
      type: "learning_answer", questionId: "q2", answer: {}, sourceSurface: "attached_follow_up", linkedRecommendationId: "rec-1",
    });
    snap = applyLearningAnswer(snap, {
      type: "learning_answer", questionId: "q3", answer: {}, sourceSurface: "in_app_chat", linkedRecommendationId: null,
    });
    expect(snap.learningBudget.usedThisPeriod).toBe(3);
    expect(snap.learningBudget.standaloneCount).toBe(2);
    expect(snap.learningBudget.attachedCount).toBe(1);
  });
});
