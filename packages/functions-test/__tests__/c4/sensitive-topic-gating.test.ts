import { describe, it, expect, beforeEach } from "vitest";
import { selectNextQuestion } from "../../../../insforge/functions/_shared/learning-service.ts";
import { seedTable, resetMock } from "../../mocks/insforge-sdk.ts";

beforeEach(() => resetMock());

describe("C4: sensitive-topic context gating", () => {
  it("skips sensitive question when user has no prior context, selects safe alternative", async () => {
    seedTable("learning_questions", [
      {
        id: "q-sensitive",
        topic_family: "nightlife",
        question_text: "Do you enjoy late-night bar hopping?",
        expected_lift: 0.9,
        confidence_gap: 0.5,
        channel_eligibility: ["in_app_chat"],
        answer_schema: { type: "free_text" },
        is_comparative: false,
        comparison_items: null,
        source_type: "template",
        sensitive_topic_flag: true,
        created_at: "2026-01-01T00:00:00Z",
        expires_at: null,
      },
      {
        id: "q-safe",
        topic_family: "food",
        question_text: "What cuisine do you prefer?",
        expected_lift: 0.7,
        confidence_gap: 0.5,
        channel_eligibility: ["in_app_chat"],
        answer_schema: { type: "free_text" },
        is_comparative: false,
        comparison_items: null,
        source_type: "template",
        sensitive_topic_flag: false,
        created_at: "2026-01-01T00:00:00Z",
        expires_at: null,
      },
    ]);

    const result = await selectNextQuestion("user-sensitive");
    expect(result.prompt).not.toBeNull();
    expect(result.prompt!.id).toBe("q-safe");
  });

  it("selects sensitive question when user has prior context for that topic", async () => {
    seedTable("learning_questions", [{
      id: "q-sens",
      topic_family: "nightlife",
      question_text: "Late night preferences?",
      expected_lift: 0.9,
      confidence_gap: 0.5,
      channel_eligibility: ["push"],
      answer_schema: { type: "free_text" },
      is_comparative: false,
      comparison_items: null,
      source_type: "template",
      sensitive_topic_flag: true,
      created_at: "2026-01-01T00:00:00Z",
      expires_at: null,
    }]);
    seedTable("persona_snapshots", [{
      id: "user-context",
      user_id: "user-context",
      version: 1,
      preferences: { pillar: {}, tags: { nightlife: 0.3 } },
      hard_filters: [],
      cadence_state: { answeredCount: 0, ignoredCount: 0, currentRate: 1, lastUpdatedAt: "" },
      learning_budget: { usedThisPeriod: 0, standaloneCount: 0, attachedCount: 0, periodStart: "", periodEnd: "" },
      boost_state: { completed: false, skipped: false, startedAt: null, completedAt: null },
      travel_state: { isAway: false, currentLocation: null, homeLocation: { lat: 47.6, lng: -122.3 } },
      plain_language_projections: [],
      last_event_sequence: 0,
      rebuilt_at: "",
      updated_at: "",
    }]);
    const result = await selectNextQuestion("user-context");
    expect(result.prompt).not.toBeNull();
    expect(result.prompt!.id).toBe("q-sens");
    expect((result.prompt as any).sensitiveTopicFlag).toBe(true);
  });

  it("falls back to generated question when only sensitive questions exist and no context", async () => {
    seedTable("learning_questions", [{
      id: "q-only-sens",
      topic_family: "nightlife",
      question_text: "Bar hopping?",
      expected_lift: 0.9,
      confidence_gap: 0.5,
      channel_eligibility: ["push"],
      answer_schema: { type: "free_text" },
      is_comparative: false,
      comparison_items: null,
      source_type: "template",
      sensitive_topic_flag: true,
      created_at: "2026-01-01T00:00:00Z",
      expires_at: null,
    }]);
    const result = await selectNextQuestion("user-no-context");
    expect(result.prompt).not.toBeNull();
    expect(result.prompt!.sourceType).toBe("llm_generated");
  });
});
