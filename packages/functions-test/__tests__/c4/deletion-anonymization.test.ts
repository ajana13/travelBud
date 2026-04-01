import { describe, it, expect, beforeEach } from "vitest";
import handler from "../../../../insforge/functions/account-delete/index.ts";
import { setMockUser, seedTable, getTableData, resetMock } from "../../mocks/insforge-sdk.ts";
import { makeRequest, getBody, VALID_TOKEN } from "../helpers.ts";

beforeEach(() => resetMock());

const USER_A = { id: "del-user-a", email: "a@test.com" };
const USER_B = { id: "del-user-b", email: "b@test.com" };

function seedUserData(userId: string) {
  seedTable("persona_snapshots", [
    ...(getTableData("persona_snapshots") || []),
    { id: userId, user_id: userId, version: 1, preferences: { pillar: {}, tags: {} } },
  ]);
  seedTable("persona_events", [
    ...(getTableData("persona_events") || []),
    { id: `evt-${userId}`, user_id: userId, type: "action", sequence_number: 1 },
  ]);
  seedTable("notification_preferences", [
    ...(getTableData("notification_preferences") || []),
    { id: `np-${userId}`, user_id: userId, push_enabled: true },
  ]);
  seedTable("consent_records", [
    ...(getTableData("consent_records") || []),
    { id: `cr-${userId}`, user_id: userId, consent_type: "boost" },
  ]);
}

describe("C4: deletion/anonymization", () => {
  it("account delete purges user data from all 4 tables", async () => {
    setMockUser(USER_A);
    seedUserData(USER_A.id);

    const res = await handler(makeRequest("DELETE", { token: VALID_TOKEN }));
    expect(res.status).toBe(200);
    const body = await getBody(res);
    expect(body.data.deleted).toBe(true);

    expect(getTableData("persona_snapshots")!.filter((r) => r.user_id === USER_A.id)).toHaveLength(0);
    expect(getTableData("persona_events")!.filter((r) => r.user_id === USER_A.id)).toHaveLength(0);
    expect(getTableData("notification_preferences")!.filter((r) => r.user_id === USER_A.id)).toHaveLength(0);
    expect(getTableData("consent_records")!.filter((r) => r.user_id === USER_A.id)).toHaveLength(0);
  });

  it("other users' data is unaffected by deletion", async () => {
    setMockUser(USER_A);
    seedUserData(USER_A.id);
    seedUserData(USER_B.id);

    await handler(makeRequest("DELETE", { token: VALID_TOKEN }));

    expect(getTableData("persona_snapshots")!.filter((r) => r.user_id === USER_B.id)).toHaveLength(1);
    expect(getTableData("persona_events")!.filter((r) => r.user_id === USER_B.id)).toHaveLength(1);
    expect(getTableData("notification_preferences")!.filter((r) => r.user_id === USER_B.id)).toHaveLength(1);
    expect(getTableData("consent_records")!.filter((r) => r.user_id === USER_B.id)).toHaveLength(1);
  });

  it("deleting non-existent user data succeeds gracefully", async () => {
    setMockUser({ id: "ghost-user", email: "ghost@test.com" });
    const res = await handler(makeRequest("DELETE", { token: VALID_TOKEN }));
    expect(res.status).toBe(200);
    const body = await getBody(res);
    expect(body.data.deleted).toBe(true);
  });
});
