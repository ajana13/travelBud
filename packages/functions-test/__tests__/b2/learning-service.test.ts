import { describe, it, expect, beforeEach } from "vitest";
import {
  selectNextQuestion,
  ingestAnswer,
  checkSessionCap,
  updateCadence,
  SESSION_CAP,
} from "../../../../insforge/functions/_shared/learning-service.ts";
import { seedTable, getTableData, resetMock } from "../../mocks/insforge-sdk.ts";

beforeEach(() => resetMock());

const SAMPLE_QUESTION_ROW = {
  id: "q-001",
  topic_family: "food",
  question_text: "Do you prefer sushi or pizza?",
  expected_lift: 0.8,
  confidence_gap: 0.5,
  channel_eligibility: ["in_app_chat"],
  answer_schema: { type: "single_select", options: ["sushi", "pizza"] },
  is_comparative: true,
  comparison_items: { a: "sushi", b: "pizza" },
  source_type: "template",
  sensitive_topic_flag: false,
  created_at: "2026-01-01T00:00:00Z",
  expires_at: null,
};

describe("learning-service", () => {
  describe("checkSessionCap()", () => {
    it("returns false when budget is not exhausted", () => {
      const snapshot = {
        learningBudget: { usedThisPeriod: 0, periodStart: "", periodEnd: "" },
      } as any;
      expect(checkSessionCap(snapshot)).toBe(false);
    });

    it("returns true when budget equals cap", () => {
      const snapshot = {
        learningBudget: { usedThisPeriod: SESSION_CAP, periodStart: "", periodEnd: "" },
      } as any;
      expect(checkSessionCap(snapshot)).toBe(true);
    });

    it("returns true when budget exceeds cap", () => {
      const snapshot = {
        learningBudget: { usedThisPeriod: SESSION_CAP + 3, periodStart: "", periodEnd: "" },
      } as any;
      expect(checkSessionCap(snapshot)).toBe(true);
    });
  });

  describe("updateCadence()", () => {
    it("increments answeredCount when answered is true", () => {
      const snapshot = {
        cadenceState: { answeredCount: 2, ignoredCount: 1, currentRate: 0.67, lastUpdatedAt: "" },
      } as any;
      const result = updateCadence(snapshot, true);
      expect(result.cadenceState.answeredCount).toBe(3);
      expect(result.cadenceState.ignoredCount).toBe(1);
      expect(result.cadenceState.currentRate).toBe(0.75);
    });

    it("increments ignoredCount when answered is false", () => {
      const snapshot = {
        cadenceState: { answeredCount: 2, ignoredCount: 1, currentRate: 0.67, lastUpdatedAt: "" },
      } as any;
      const result = updateCadence(snapshot, false);
      expect(result.cadenceState.answeredCount).toBe(2);
      expect(result.cadenceState.ignoredCount).toBe(2);
      expect(result.cadenceState.currentRate).toBe(0.5);
    });

    it("handles zero total gracefully", () => {
      const snapshot = {
        cadenceState: { answeredCount: 0, ignoredCount: 0, currentRate: 1, lastUpdatedAt: "" },
      } as any;
      const result = updateCadence(snapshot, true);
      expect(result.cadenceState.currentRate).toBe(1);
    });
  });

  describe("selectNextQuestion()", () => {
    it("returns null prompt when no questions in DB", async () => {
      const result = await selectNextQuestion("user-001");
      expect(result.prompt).toBeNull();
      expect(result.sessionCap).toBe(SESSION_CAP);
      expect(result.sessionLearningCount).toBe(0);
    });

    it("returns question when available", async () => {
      seedTable("learning_questions", [SAMPLE_QUESTION_ROW]);
      const result = await selectNextQuestion("user-001");
      expect(result.prompt).not.toBeNull();
      expect(result.prompt!.id).toBe("q-001");
      expect(result.prompt!.questionText).toBe("Do you prefer sushi or pizza?");
    });

    it("returns null prompt when session cap is reached", async () => {
      seedTable("learning_questions", [SAMPLE_QUESTION_ROW]);
      seedTable("persona_snapshots", [{
        id: "user-001",
        user_id: "user-001",
        version: 1,
        preferences: { pillar: {}, tags: {} },
        hard_filters: [],
        cadence_state: { answeredCount: 5, ignoredCount: 0, currentRate: 1, lastUpdatedAt: "" },
        learning_budget: { usedThisPeriod: SESSION_CAP, periodStart: "", periodEnd: "" },
        boost_state: { completed: false, skipped: false, startedAt: null, completedAt: null },
        travel_state: { isAway: false, currentLocation: null, homeLocation: { lat: 47.6, lng: -122.3 } },
        plain_language_projections: [],
        last_event_sequence: 0,
        rebuilt_at: "2026-01-01",
        updated_at: "2026-01-01",
      }]);
      const result = await selectNextQuestion("user-001");
      expect(result.prompt).toBeNull();
      expect(result.sessionLearningCount).toBe(SESSION_CAP);
    });

    it("filters out expired questions", async () => {
      seedTable("learning_questions", [{
        ...SAMPLE_QUESTION_ROW,
        expires_at: "2020-01-01T00:00:00Z",
      }]);
      const result = await selectNextQuestion("user-001");
      expect(result.prompt).toBeNull();
    });
  });

  describe("ingestAnswer()", () => {
    it("stores answer and updates persona", async () => {
      const result = await ingestAnswer("user-001", {
        questionId: "q-001",
        answer: { selected: "sushi" },
        sourceSurface: "in_app_chat",
        linkedRecommendationId: null,
      });
      expect(result.accepted).toBe(true);
      expect(result.personaUpdated).toBe(true);
      expect(result.feedStale).toBe(true);
      expect(result.followUpQuestion).toBeNull();
    });

    it("inserts row into learning_answers table", async () => {
      await ingestAnswer("user-001", {
        questionId: "q-001",
        answer: { selected: "pizza" },
        sourceSurface: "push",
        linkedRecommendationId: null,
      });
      const answers = getTableData("learning_answers");
      expect(answers).toBeDefined();
      expect(answers!.length).toBe(1);
      expect(answers![0].user_id).toBe("user-001");
      expect(answers![0].question_id).toBe("q-001");
    });

    it("appends learning_answer event to persona_events", async () => {
      await ingestAnswer("user-001", {
        questionId: "q-001",
        answer: { selected: "sushi" },
        sourceSurface: "attached_follow_up",
        linkedRecommendationId: "rec-123",
      });
      const events = getTableData("persona_events");
      expect(events).toBeDefined();
      expect(events!.length).toBeGreaterThanOrEqual(1);
      const last = events![events!.length - 1];
      expect(last.type).toBe("learning_answer");
      expect(last.user_id).toBe("user-001");
    });
  });
});
