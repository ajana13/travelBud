import { describe, it, expect, beforeEach } from "vitest";
import handler from "../../../insforge/functions/learning-prompt/index.ts";
import { setMockUser, resetMock, seedTable } from "../mocks/insforge-sdk.ts";
import { makeRequest, getBody, expectCors, expectErrorEnvelope, VALID_TOKEN, MOCK_USER } from "./helpers.ts";

beforeEach(() => resetMock());

describe("learning-prompt", () => {
  it("returns 204 on OPTIONS preflight", async () => {
    const res = await handler(makeRequest("OPTIONS"));
    expect(res.status).toBe(204);
    expectCors(res);
  });

  it("returns 405 on wrong method (POST)", async () => {
    const res = await handler(makeRequest("POST", { token: VALID_TOKEN }));
    expect(res.status).toBe(405);
    const body = await getBody(res);
    expectErrorEnvelope(body, "METHOD_NOT_ALLOWED");
  });

  it("returns 401 when Authorization header is missing", async () => {
    const res = await handler(makeRequest("GET"));
    expect(res.status).toBe(401);
    const body = await getBody(res);
    expectErrorEnvelope(body, "UNAUTHORIZED");
  });

  it("returns 401 when user is not found", async () => {
    setMockUser(null);
    const res = await handler(makeRequest("GET", { token: VALID_TOKEN }));
    expect(res.status).toBe(401);
  });

  it("returns 200 with prompt response for authenticated user", async () => {
    setMockUser(MOCK_USER);
    const res = await handler(makeRequest("GET", { token: VALID_TOKEN }));
    expect(res.status).toBe(200);
    const body = await getBody(res);
    expect(body.data).toHaveProperty("sessionCap");
    expect(body.data).toHaveProperty("sessionLearningCount");
    expect(body.data.prompt).toBeNull();
    expectCors(res);
  });

  it("returns a question when one exists in DB", async () => {
    setMockUser(MOCK_USER);
    seedTable("learning_questions", [{
      id: "q-100",
      topic_family: "food",
      question_text: "Thai or Mexican?",
      expected_lift: 0.9,
      confidence_gap: 0.4,
      channel_eligibility: ["in_app_chat"],
      answer_schema: { type: "single_select", options: ["Thai", "Mexican"] },
      is_comparative: true,
      comparison_items: { a: "Thai", b: "Mexican" },
      source_type: "template",
      sensitive_topic_flag: false,
      created_at: "2026-01-01T00:00:00Z",
      expires_at: null,
    }]);
    const res = await handler(makeRequest("GET", { token: VALID_TOKEN }));
    expect(res.status).toBe(200);
    const body = await getBody(res);
    expect(body.data.prompt).not.toBeNull();
    expect(body.data.prompt.id).toBe("q-100");
  });
});
