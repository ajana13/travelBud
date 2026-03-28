import { describe, it, expect, beforeEach } from "vitest";
import handler from "../../../insforge/functions/persona/index.ts";
import { setMockUser, getLastCreateClientOpts, resetMock } from "../mocks/insforge-sdk.ts";
import { makeRequest, getBody, expectCors, expectErrorEnvelope, VALID_TOKEN, MOCK_USER } from "./helpers.ts";

beforeEach(() => resetMock());

describe("persona", () => {
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

  it("returns 405 on wrong method (DELETE)", async () => {
    const res = await handler(makeRequest("DELETE", { token: VALID_TOKEN }));
    expect(res.status).toBe(405);
    const body = await getBody(res);
    expectErrorEnvelope(body, "METHOD_NOT_ALLOWED");
  });

  it("returns 401 when Authorization header is missing (GET)", async () => {
    const res = await handler(makeRequest("GET"));
    expect(res.status).toBe(401);
    const body = await getBody(res);
    expectErrorEnvelope(body, "UNAUTHORIZED");
  });

  it("returns 401 when user is not found (GET)", async () => {
    setMockUser(null);
    const res = await handler(makeRequest("GET", { token: VALID_TOKEN }));
    expect(res.status).toBe(401);
  });

  it("returns 501 NOT_IMPLEMENTED on GET with valid auth", async () => {
    setMockUser(MOCK_USER);
    const res = await handler(makeRequest("GET", { token: VALID_TOKEN }));
    expect(res.status).toBe(501);
    const body = await getBody(res);
    expectErrorEnvelope(body, "NOT_IMPLEMENTED");
    expect(body.error.message).toContain("GET");
    expectCors(res);
  });

  it("returns 501 NOT_IMPLEMENTED on PATCH with valid auth", async () => {
    setMockUser(MOCK_USER);
    const res = await handler(makeRequest("PATCH", { token: VALID_TOKEN }));
    expect(res.status).toBe(501);
    const body = await getBody(res);
    expectErrorEnvelope(body, "NOT_IMPLEMENTED");
    expect(body.error.message).toContain("PATCH");
    expectCors(res);
  });

  it("passes edgeFunctionToken to createClient", async () => {
    setMockUser(MOCK_USER);
    await handler(makeRequest("GET", { token: VALID_TOKEN }));
    const opts = getLastCreateClientOpts();
    expect(opts).toHaveProperty("edgeFunctionToken", VALID_TOKEN);
  });
});
