import { describe, it, expect, beforeEach } from "vitest";
import handler from "../../../insforge/functions/chat-messages/index.ts";
import { setMockUser, resetMock, getTableData } from "../mocks/insforge-sdk.ts";
import { makeRequest, getBody, expectCors, expectErrorEnvelope, VALID_TOKEN, MOCK_USER } from "./helpers.ts";

beforeEach(() => resetMock());

describe("chat-messages", () => {
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

  it("returns 200 with chat reply for valid message", async () => {
    setMockUser(MOCK_USER);
    const res = await handler(makeRequest("POST", {
      token: VALID_TOKEN,
      body: { message: "I love sushi", conversationId: null, learningPromptResponseId: null },
    }));
    expect(res.status).toBe(200);
    const body = await getBody(res);
    expect(body.data.reply).toBeTruthy();
    expect(body.data.conversationId).toBeTruthy();
    expectCors(res);
  });

  it("extracts persona updates from preference messages", async () => {
    setMockUser(MOCK_USER);
    const res = await handler(makeRequest("POST", {
      token: VALID_TOKEN,
      body: { message: "I love hiking", conversationId: null, learningPromptResponseId: null },
    }));
    const body = await getBody(res);
    expect(body.data.personaUpdatesApplied.length).toBeGreaterThan(0);
    expect(body.data.feedStale).toBe(true);
  });
});
