import { describe, it, expect, beforeEach } from "vitest";
import handler from "../../../insforge/functions/account-delete/index.ts";
import { setMockUser, getLastCreateClientOpts, resetMock } from "../mocks/insforge-sdk.ts";
import { makeRequest, getBody, expectCors, expectErrorEnvelope, VALID_TOKEN, MOCK_USER } from "./helpers.ts";

beforeEach(() => resetMock());

describe("account-delete", () => {
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
    const res = await handler(makeRequest("DELETE"));
    expect(res.status).toBe(401);
    const body = await getBody(res);
    expectErrorEnvelope(body, "UNAUTHORIZED");
  });

  it("returns 401 when user is not found", async () => {
    setMockUser(null);
    const res = await handler(makeRequest("DELETE", { token: VALID_TOKEN }));
    expect(res.status).toBe(401);
  });

  it("returns 200 with deleted confirmation for valid authenticated request", async () => {
    setMockUser(MOCK_USER);
    const res = await handler(makeRequest("DELETE", { token: VALID_TOKEN }));
    expect(res.status).toBe(200);
    const body = await getBody(res);
    expect(body.data.deleted).toBe(true);
    expectCors(res);
  });
});
