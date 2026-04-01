import { describe, it, expect } from "vitest";
import {
  replayEvents,
  applyAction,
  applyBoostInference,
  applyLearningAnswer,
  applyChatExtraction,
  applyConfirmation,
  applySystemDecision,
  applyPersonaEdit,
  decayPreferences,
} from "../../../../insforge/functions/_shared/persona-replay-engine.ts";
import { createDefaultSnapshot } from "../../../../insforge/functions/_shared/persona-snapshot-store.ts";

const USER_ID = "user-replay-001";

describe("persona-replay-engine", () => {
  describe("applyAction()", () => {
    it("updates pillar preference for im_in action", () => {
      const snap = createDefaultSnapshot(USER_ID);
      const payload = {
        type: "action" as const,
        actionType: "im_in" as const,
        itemId: "item-1",
        reasons: null,
        freeText: null,
      };
      const result = applyAction(snap, payload, { tags: ["music", "live"] });
      expect(result.preferences.tags["music"]).toBeGreaterThan(0);
      expect(result.preferences.tags["live"]).toBeGreaterThan(0);
    });

    it("decreases preference for pass action", () => {
      const snap = createDefaultSnapshot(USER_ID);
      snap.preferences.tags = { boring: 0.5 };
      const payload = {
        type: "action" as const,
        actionType: "pass" as const,
        itemId: "item-2",
        reasons: null,
        freeText: null,
      };
      const result = applyAction(snap, payload, { tags: ["boring"] });
      expect(result.preferences.tags["boring"]).toBeLessThan(0.5);
    });
  });

  describe("applyBoostInference()", () => {
    it("adds positive preference strength", () => {
      const snap = createDefaultSnapshot(USER_ID);
      const payload = {
        type: "boost_inference" as const,
        inferenceId: "inf-1",
        category: "food",
        direction: "positive" as const,
        strength: 0.8,
        accepted: true,
      };
      const result = applyBoostInference(snap, payload);
      expect(result.preferences.tags["food"]).toBeGreaterThan(0);
    });

    it("subtracts negative preference strength", () => {
      const snap = createDefaultSnapshot(USER_ID);
      snap.preferences.tags = { sports: 0.5 };
      const payload = {
        type: "boost_inference" as const,
        inferenceId: "inf-2",
        category: "sports",
        direction: "negative" as const,
        strength: 0.3,
        accepted: true,
      };
      const result = applyBoostInference(snap, payload);
      expect(result.preferences.tags["sports"]).toBeLessThan(0.5);
    });

    it("ignores non-accepted inferences", () => {
      const snap = createDefaultSnapshot(USER_ID);
      const payload = {
        type: "boost_inference" as const,
        inferenceId: "inf-3",
        category: "test",
        direction: "positive" as const,
        strength: 1.0,
        accepted: false,
      };
      const result = applyBoostInference(snap, payload);
      expect(result.preferences.tags["test"]).toBeUndefined();
    });
  });

  describe("applyLearningAnswer()", () => {
    it("increments answered count in cadence state", () => {
      const snap = createDefaultSnapshot(USER_ID);
      const payload = {
        type: "learning_answer" as const,
        questionId: "q-1",
        answer: { value: "yes" },
        sourceSurface: "in_app_chat" as const,
        linkedRecommendationId: null,
      };
      const result = applyLearningAnswer(snap, payload);
      expect(result.cadenceState.answeredCount).toBe(1);
    });
  });

  describe("applyChatExtraction()", () => {
    it("is a pure function that returns updated snapshot", () => {
      const snap = createDefaultSnapshot(USER_ID);
      const payload = {
        type: "chat_extraction" as const,
        conversationId: "conv-1",
        field: "cuisine_preference",
        oldValue: null,
        newValue: "Japanese",
      };
      const result = applyChatExtraction(snap, payload);
      expect(result).toBeDefined();
      expect(result.userId).toBe(USER_ID);
    });
  });

  describe("applyConfirmation()", () => {
    it("is a pure function that returns updated snapshot", () => {
      const snap = createDefaultSnapshot(USER_ID);
      const payload = {
        type: "confirmation" as const,
        itemId: "item-1",
        confirmed: true,
        feedback: null,
      };
      const result = applyConfirmation(snap, payload);
      expect(result).toBeDefined();
    });
  });

  describe("applySystemDecision()", () => {
    it("is a pure function that returns updated snapshot", () => {
      const snap = createDefaultSnapshot(USER_ID);
      const payload = {
        type: "system_decision" as const,
        decisionType: "cadence_adjust",
        reason: "too many ignored",
        affectedField: "currentRate",
        previousValue: 1.0,
        newValue: 0.5,
      };
      const result = applySystemDecision(snap, payload);
      expect(result).toBeDefined();
    });
  });

  describe("applyPersonaEdit()", () => {
    it("updates a plain language projection", () => {
      const snap = createDefaultSnapshot(USER_ID);
      snap.plainLanguageProjections = [
        { id: "proj-1", category: "food", statement: "Likes sushi", confidence: "high", editable: true },
      ];
      const payload = {
        type: "persona_edit" as const,
        projectionId: "proj-1",
        oldValue: "Likes sushi",
        newValue: "Loves sushi and ramen",
      };
      const result = applyPersonaEdit(snap, payload);
      const proj = result.plainLanguageProjections.find((p) => p.id === "proj-1");
      expect(proj!.statement).toBe("Loves sushi and ramen");
    });
  });

  describe("applyAction() ambiguity-first", () => {
    it("discounts pass weight when tag confidence is low", () => {
      const snap = createDefaultSnapshot(USER_ID);
      snap.preferences.tags = { sushi: -0.1 };
      const payload = {
        type: "action" as const,
        actionType: "pass" as const,
        itemId: "item-1",
        reasons: null,
        freeText: null,
      };
      const result = applyAction(snap, payload, { tags: ["sushi"] });
      // Low confidence (abs(-0.1) < 0.3) so pass weight is discounted by 0.5
      const delta = result.preferences.tags["sushi"] - (-0.1);
      expect(delta).toBeGreaterThan(-0.15);
    });

    it("applies stronger pass weight when contradicting a positive signal", () => {
      const snap = createDefaultSnapshot(USER_ID);
      snap.preferences.tags = { hiking: 0.5 };
      const payload = {
        type: "action" as const,
        actionType: "pass" as const,
        itemId: "item-1",
        reasons: null,
        freeText: null,
      };
      const result = applyAction(snap, payload, { tags: ["hiking"] });
      const delta = result.preferences.tags["hiking"] - 0.5;
      // Contradiction amplification: 1.5x base weight
      expect(delta).toBeLessThan(-0.15);
    });

    it("applies stronger im_in weight when contradicting a negative signal", () => {
      const snap = createDefaultSnapshot(USER_ID);
      snap.preferences.tags = { karaoke: -0.3 };
      const payload = {
        type: "action" as const,
        actionType: "im_in" as const,
        itemId: "item-1",
        reasons: null,
        freeText: null,
      };
      const result = applyAction(snap, payload, { tags: ["karaoke"] });
      const delta = result.preferences.tags["karaoke"] - (-0.3);
      // Contradiction: 1.5x im_in weight
      expect(delta).toBeGreaterThan(0.3);
    });

    it("cant action applies zero weight", () => {
      const snap = createDefaultSnapshot(USER_ID);
      snap.preferences.tags = { music: 0.5 };
      const payload = {
        type: "action" as const,
        actionType: "cant" as const,
        itemId: "item-1",
        reasons: null,
        freeText: null,
      };
      const result = applyAction(snap, payload, { tags: ["music"] });
      expect(result.preferences.tags["music"]).toBe(0.5);
    });
  });

  describe("decayPreferences()", () => {
    it("decays tag scores toward zero", () => {
      const snap = createDefaultSnapshot(USER_ID);
      snap.preferences.tags = { music: 0.5, sushi: -0.4 };
      const result = decayPreferences(snap);
      expect(result.preferences.tags["music"]).toBeLessThan(0.5);
      expect(result.preferences.tags["music"]).toBeGreaterThan(0);
      expect(result.preferences.tags["sushi"]!).toBeGreaterThan(-0.4);
      expect(result.preferences.tags["sushi"]!).toBeLessThan(0);
    });

    it("removes near-zero scores", () => {
      const snap = createDefaultSnapshot(USER_ID);
      snap.preferences.tags = { tiny: 0.005 };
      const result = decayPreferences(snap);
      expect(result.preferences.tags["tiny"]).toBeUndefined();
    });

    it("decays pillar scores too", () => {
      const snap = createDefaultSnapshot(USER_ID);
      snap.preferences.pillar = { events: 0.8 };
      const result = decayPreferences(snap);
      expect(result.preferences.pillar["events"]).toBeLessThan(0.8);
    });

    it("supports custom decay factor", () => {
      const snap = createDefaultSnapshot(USER_ID);
      snap.preferences.tags = { music: 1.0 };
      const result = decayPreferences(snap, 0.5);
      expect(result.preferences.tags["music"]).toBeCloseTo(0.5);
    });
  });

  describe("replayEvents()", () => {
    it("replays a sequence of events onto a snapshot", () => {
      const snap = createDefaultSnapshot(USER_ID);
      const events = [
        {
          id: "e1",
          userId: USER_ID,
          type: "action" as const,
          version: 1,
          payload: {
            type: "action" as const,
            actionType: "im_in" as const,
            itemId: "item-1",
            reasons: null,
            freeText: null,
          },
          source: { surface: "feed", sessionId: null },
          timestamp: new Date().toISOString(),
          sequenceNumber: 1,
        },
        {
          id: "e2",
          userId: USER_ID,
          type: "learning_answer" as const,
          version: 1,
          payload: {
            type: "learning_answer" as const,
            questionId: "q-1",
            answer: { val: "yes" },
            sourceSurface: "push" as const,
            linkedRecommendationId: null,
          },
          source: { surface: "push", sessionId: null },
          timestamp: new Date().toISOString(),
          sequenceNumber: 2,
        },
      ];
      const result = replayEvents(snap, events);
      expect(result.lastEventSequence).toBe(2);
      expect(result.cadenceState.answeredCount).toBe(1);
    });

    it("returns unchanged snapshot for empty events", () => {
      const snap = createDefaultSnapshot(USER_ID);
      const result = replayEvents(snap, []);
      expect(result).toEqual(snap);
    });
  });
});
