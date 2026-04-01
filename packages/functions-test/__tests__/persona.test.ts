import { describe, it, expect, beforeEach } from "vitest";
import handler from "../../../insforge/functions/persona/index.ts";
import { setMockUser, resetMock } from "../mocks/insforge-sdk.ts";
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

  it("returns 200 with persona view on GET", async () => {
    setMockUser(MOCK_USER);
    const res = await handler(makeRequest("GET", { token: VALID_TOKEN }));
    expect(res.status).toBe(200);
    const body = await getBody(res);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data.projections)).toBe(true);
    expect(Array.isArray(body.data.hardFilters)).toBe(true);
    expect(body.data.boostState).toBeDefined();
    expect(typeof body.data.boostState.completed).toBe("boolean");
    expectCors(res);
  });

  it("returns 400 on PATCH with invalid body", async () => {
    setMockUser(MOCK_USER);
    const res = await handler(makeRequest("PATCH", { token: VALID_TOKEN, body: { bad: true } }));
    expect(res.status).toBe(400);
    const body = await getBody(res);
    expectErrorEnvelope(body, "VALIDATION_ERROR");
  });

  it("returns 200 on PATCH with valid edits", async () => {
    setMockUser(MOCK_USER);
    const res = await handler(makeRequest("PATCH", {
      token: VALID_TOKEN,
      body: { edits: [], hardFilterToggles: [] },
    }));
    expect(res.status).toBe(200);
    const body = await getBody(res);
    expect(body.data.updated).toBe(false);
    expect(Array.isArray(body.data.projections)).toBe(true);
    expect(typeof body.data.feedStale).toBe("boolean");
  });
});
