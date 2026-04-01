import { describe, it, expect, beforeEach } from "vitest";
import handler from "../../../insforge/functions/persona-boost-start/index.ts";
import { setMockUser, resetMock, getTableData } from "../mocks/insforge-sdk.ts";
import { makeRequest, getBody, expectCors, expectErrorEnvelope, VALID_TOKEN, MOCK_USER } from "./helpers.ts";

beforeEach(() => resetMock());

describe("persona-boost-start", () => {
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

  it("returns 200 with boost result for valid request", async () => {
    setMockUser(MOCK_USER);
    const res = await handler(makeRequest("POST", {
      token: VALID_TOKEN,
      body: { email: "user@test.com", consentGiven: true },
    }));
    expect(res.status).toBe(200);
    const body = await getBody(res);
    expect(body.data.boostId).toBeTruthy();
    expect(body.data.status).toBe("completed");
    expectCors(res);
  });

  it("returns failed status when consent not given", async () => {
    setMockUser(MOCK_USER);
    const res = await handler(makeRequest("POST", {
      token: VALID_TOKEN,
      body: { email: "user@test.com", consentGiven: false },
    }));
    expect(res.status).toBe(200);
    const body = await getBody(res);
    expect(body.data.status).toBe("failed");
  });
});
