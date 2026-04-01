import { describe, it, expect, beforeEach } from "vitest";
import { selectNextQuestion, SESSION_CAP } from "../../../../insforge/functions/_shared/learning-service.ts";
import { seedTable, resetMock } from "../../mocks/insforge-sdk.ts";

beforeEach(() => resetMock());

const makeQuestion = (id: string, lift: number, expiresAt: string | null = null) => ({
  id,
  topic_family: "food",
  question_text: `Question ${id}`,
  expected_lift: lift,
  confidence_gap: 0.5,
  channel_eligibility: ["in_app_chat"],
  answer_schema: { type: "free_text" },
  is_comparative: false,
  comparison_items: null,
  source_type: "template",
  sensitive_topic_flag: false,
  created_at: "2026-01-01T00:00:00Z",
  expires_at: expiresAt,
});

describe("C4: learning selector priority", () => {
  it("selects highest expected_lift question first", async () => {
    seedTable("learning_questions", [
      makeQuestion("q-low", 0.2),
      makeQuestion("q-high", 0.9),
      makeQuestion("q-mid", 0.5),
    ]);
    const result = await selectNextQuestion("user-sel");
    expect(result.prompt).not.toBeNull();
    expect(result.prompt!.id).toBe("q-high");
  });

  it("skips expired questions and selects next best", async () => {
    seedTable("learning_questions", [
      makeQuestion("q-expired", 0.9, "2020-01-01T00:00:00Z"),
      makeQuestion("q-valid", 0.5),
    ]);
    const result = await selectNextQuestion("user-sel");
    expect(result.prompt!.id).toBe("q-valid");
  });

  it("falls back to generated question when all DB questions expired", async () => {
    seedTable("learning_questions", [
      makeQuestion("q-exp1", 0.9, "2020-01-01T00:00:00Z"),
      makeQuestion("q-exp2", 0.8, "2020-01-01T00:00:00Z"),
    ]);
    const result = await selectNextQuestion("user-sel");
    expect(result.prompt).not.toBeNull();
    expect(result.prompt!.sourceType).toBe("llm_generated");
  });

  it("returns null when session cap reached regardless of available questions", async () => {
    seedTable("learning_questions", [makeQuestion("q-available", 0.9)]);
    seedTable("persona_snapshots", [{
      id: "user-capped",
      user_id: "user-capped",
      version: 1,
      preferences: { pillar: {}, tags: {} },
      hard_filters: [],
      cadence_state: { answeredCount: SESSION_CAP, ignoredCount: 0, currentRate: 1, lastUpdatedAt: "" },
      learning_budget: { usedThisPeriod: SESSION_CAP, standaloneCount: SESSION_CAP, attachedCount: 0, periodStart: "", periodEnd: "" },
      boost_state: { completed: false, skipped: false, startedAt: null, completedAt: null },
      travel_state: { isAway: false, currentLocation: null, homeLocation: { lat: 47.6, lng: -122.3 } },
      plain_language_projections: [],
      last_event_sequence: 0,
      rebuilt_at: "",
      updated_at: "",
    }]);
    const result = await selectNextQuestion("user-capped");
    expect(result.prompt).toBeNull();
  });
});
