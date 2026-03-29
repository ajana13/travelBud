import { describe, it, expect, beforeEach } from "vitest";
import handler from "../../../../insforge/functions/account-delete/index.ts";
import { setMockUser, seedTable, getTableData, resetMock } from "../../mocks/insforge-sdk.ts";
import { makeRequest, getBody, expectCors, VALID_TOKEN, MOCK_USER } from "../helpers.ts";

beforeEach(() => resetMock());

describe("account-delete (A2 implementation)", () => {
  it("returns 204 on OPTIONS", async () => {
    const res = await handler(makeRequest("OPTIONS"));
    expect(res.status).toBe(204);
  });

  it("returns 401 without auth", async () => {
    const res = await handler(makeRequest("DELETE"));
    expect(res.status).toBe(401);
  });

  it("returns 405 on wrong method", async () => {
    const res = await handler(makeRequest("GET", { token: VALID_TOKEN }));
    expect(res.status).toBe(405);
  });

  it("deletes user data and returns success", async () => {
    setMockUser(MOCK_USER);
    seedTable("persona_events", [
      { id: "e1", user_id: MOCK_USER.id, type: "action" },
    ]);
    seedTable("persona_snapshots", [
      { id: MOCK_USER.id, user_id: MOCK_USER.id },
    ]);
    seedTable("consent_records", [
      { id: "c1", user_id: MOCK_USER.id, consent_type: "loc" },
    ]);
    seedTable("notification_preferences", [
      { id: "n1", user_id: MOCK_USER.id },
    ]);

    const res = await handler(makeRequest("DELETE", { token: VALID_TOKEN }));
    expect(res.status).toBe(200);
    const body = await getBody(res);
    expect(body.data.deleted).toBe(true);
    expectCors(res);

    expect(getTableData("persona_events")!.filter((r: any) => r.user_id === MOCK_USER.id)).toHaveLength(0);
    expect(getTableData("persona_snapshots")!.filter((r: any) => r.user_id === MOCK_USER.id)).toHaveLength(0);
    expect(getTableData("consent_records")!.filter((r: any) => r.user_id === MOCK_USER.id)).toHaveLength(0);
    expect(getTableData("notification_preferences")!.filter((r: any) => r.user_id === MOCK_USER.id)).toHaveLength(0);
  });
});
