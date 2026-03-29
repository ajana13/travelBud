import { describe, it, expect, beforeEach } from "vitest";
import handler from "../../../../insforge/functions/notifications-preferences/index.ts";
import { setMockUser, seedTable, getTableData, resetMock } from "../../mocks/insforge-sdk.ts";
import { makeRequest, getBody, expectCors, VALID_TOKEN, MOCK_USER } from "../helpers.ts";

beforeEach(() => resetMock());

describe("notifications-preferences (A2 implementation)", () => {
  it("returns 204 on OPTIONS", async () => {
    const res = await handler(makeRequest("OPTIONS"));
    expect(res.status).toBe(204);
  });

  it("returns 401 without auth", async () => {
    const res = await handler(makeRequest("POST"));
    expect(res.status).toBe(401);
  });

  it("returns 400 with invalid body", async () => {
    setMockUser(MOCK_USER);
    const res = await handler(
      makeRequest("POST", { token: VALID_TOKEN, body: {} })
    );
    expect(res.status).toBe(400);
    const body = await getBody(res);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("saves notification preferences with valid body", async () => {
    setMockUser(MOCK_USER);
    const res = await handler(
      makeRequest("POST", {
        token: VALID_TOKEN,
        body: {
          pushEnabled: true,
          emailEnabled: false,
          channels: { learning: true, recommendations: true, system: false },
        },
      })
    );
    expect(res.status).toBe(200);
    const body = await getBody(res);
    expect(body.data.pushEnabled).toBe(true);
    expectCors(res);
  });
});
