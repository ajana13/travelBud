import { describe, it, expect, beforeEach } from "vitest";
import handler from "../../../insforge/functions/learning-answer/index.ts";
import { setMockUser, resetMock, getTableData } from "../mocks/insforge-sdk.ts";
import { makeRequest, getBody, expectCors, expectErrorEnvelope, VALID_TOKEN, MOCK_USER } from "./helpers.ts";

beforeEach(() => resetMock());

const VALID_ANSWER_BODY = {
  questionId: "q-001",
  answer: { selected: "sushi" },
  sourceSurface: "in_app_chat",
  linkedRecommendationId: null,
};

describe("learning-answer", () => {
  it("returns 204 on OPTIONS preflight", async () => {
    const res = await handler(makeRequest("OPTIONS"));
    expect(res.status).toBe(204);
    expectCors(res);
  });

  it("returns 405 on wrong method (GET)", async () => {
    const res = await handler(makeRequest("GET", { token: VALID_TOKEN }));
    expect(res.status).toBe(405);
    const body = await getBody(res);
    expectErrorEnvelope(body, "METHOD_NOT_ALLOWED");
  });

  it("returns 401 when Authorization header is missing", async () => {
    const res = await handler(makeRequest("POST"));
    expect(res.status).toBe(401);
    const body = await getBody(res);
    expectErrorEnvelope(body, "UNAUTHORIZED");
  });

  it("returns 401 when user is not found", async () => {
    setMockUser(null);
    const res = await handler(makeRequest("POST", { token: VALID_TOKEN }));
    expect(res.status).toBe(401);
  });

  it("returns 400 on invalid body", async () => {
    setMockUser(MOCK_USER);
    const res = await handler(makeRequest("POST", { token: VALID_TOKEN, body: { bad: true } }));
    expect(res.status).toBe(400);
    const body = await getBody(res);
    expectErrorEnvelope(body, "VALIDATION_ERROR");
  });

  it("returns 200 on valid learning answer", async () => {
    setMockUser(MOCK_USER);
    const res = await handler(makeRequest("POST", { token: VALID_TOKEN, body: VALID_ANSWER_BODY }));
    expect(res.status).toBe(200);
    const body = await getBody(res);
    expect(body.data.accepted).toBe(true);
    expect(body.data.personaUpdated).toBe(true);
    expect(body.data.feedStale).toBe(true);
    expectCors(res);
  });

  it("stores the answer in learning_answers table", async () => {
    setMockUser(MOCK_USER);
    await handler(makeRequest("POST", { token: VALID_TOKEN, body: VALID_ANSWER_BODY }));
    const answers = getTableData("learning_answers");
    expect(answers).toBeDefined();
    expect(answers!.length).toBe(1);
    expect(answers![0].question_id).toBe("q-001");
  });
});
