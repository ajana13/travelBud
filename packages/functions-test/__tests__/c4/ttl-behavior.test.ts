import { describe, it, expect, beforeEach } from "vitest";
import { markPushTTL, selectNextQuestion } from "../../../../insforge/functions/_shared/learning-service.ts";
import { seedTable, getTableData, resetMock } from "../../mocks/insforge-sdk.ts";

beforeEach(() => resetMock());

const makeQuestion = (id: string, expiresAt: string | null = null) => ({
  id,
  topic_family: "food",
  question_text: `Question ${id}`,
  expected_lift: 0.8,
  confidence_gap: 0.5,
  channel_eligibility: ["push"],
  answer_schema: { type: "free_text" },
  is_comparative: false,
  comparison_items: null,
  source_type: "template",
  sensitive_topic_flag: false,
  created_at: "2026-01-01T00:00:00Z",
  expires_at: expiresAt,
});

describe("C4: 60-minute TTL behavior", () => {
  it("markPushTTL sets expires_at approximately 60 minutes from now", async () => {
    seedTable("learning_questions", [makeQuestion("q-ttl")]);
    const before = Date.now();
    await markPushTTL("q-ttl");
    const after = Date.now();

    const questions = getTableData("learning_questions");
    const q = questions!.find((r: Record<string, unknown>) => r.id === "q-ttl");
    expect(q).toBeDefined();
    expect(q!.expires_at).toBeTruthy();

    const expiresMs = new Date(q!.expires_at as string).getTime();
    const expectedMin = before + 59 * 60 * 1000;
    const expectedMax = after + 61 * 60 * 1000;
    expect(expiresMs).toBeGreaterThanOrEqual(expectedMin);
    expect(expiresMs).toBeLessThanOrEqual(expectedMax);
  });

  it("question with past expires_at is filtered from selectNextQuestion", async () => {
    seedTable("learning_questions", [
      makeQuestion("q-expired", "2020-01-01T00:00:00Z"),
      makeQuestion("q-valid", null),
    ]);
    const result = await selectNextQuestion("user-ttl");
    expect(result.prompt!.id).toBe("q-valid");
  });

  it("question without expires_at is available", async () => {
    seedTable("learning_questions", [makeQuestion("q-no-ttl", null)]);
    const result = await selectNextQuestion("user-ttl");
    expect(result.prompt).not.toBeNull();
    expect(result.prompt!.id).toBe("q-no-ttl");
  });
});
