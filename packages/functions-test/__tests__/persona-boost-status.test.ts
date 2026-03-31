import { describe, it, expect, beforeEach } from "vitest";
import handler from "../../../insforge/functions/persona-boost-status/index.ts";
import { setMockUser, resetMock, seedTable } from "../mocks/insforge-sdk.ts";
import { makeRequest, getBody, expectCors, expectErrorEnvelope, VALID_TOKEN, MOCK_USER } from "./helpers.ts";

beforeEach(() => resetMock());

describe("persona-boost-status", () => {
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

  it("returns 200 with not_started for new user", async () => {
    setMockUser(MOCK_USER);
    const res = await handler(makeRequest("GET", { token: VALID_TOKEN }));
    expect(res.status).toBe(200);
    const body = await getBody(res);
    expect(body.data.status).toBe("not_started");
    expect(body.data.inferences).toHaveLength(0);
    expectCors(res);
  });

  it("returns completed with inferences for boosted user", async () => {
    setMockUser(MOCK_USER);
    seedTable("persona_snapshots", [{
      id: MOCK_USER.id,
      user_id: MOCK_USER.id,
      version: 1,
      preferences: { pillar: {}, tags: {} },
      hard_filters: [],
      cadence_state: { answeredCount: 0, ignoredCount: 0, currentRate: 1, lastUpdatedAt: "" },
      learning_budget: { usedThisPeriod: 0, periodStart: "", periodEnd: "" },
      boost_state: { completed: true, skipped: false, startedAt: "2026-01-01", completedAt: "2026-01-01" },
      travel_state: { isAway: false, currentLocation: null, homeLocation: { lat: 47.6, lng: -122.3 } },
      plain_language_projections: [],
      last_event_sequence: 0,
      rebuilt_at: "2026-01-01",
      updated_at: "2026-01-01",
    }]);
    seedTable("boost_inferences", [{
      id: "bi-1",
      user_id: MOCK_USER.id,
      source_type: "email_analysis",
      source_detail: "test@test.com",
      inferred_preference: { category: "dining", direction: "positive", strength: 0.6 },
      confidence: 0.65,
      visibility_state: "visible",
      acceptance_status: "pending",
      plain_language_label: "Enjoys dining",
      created_at: "2026-01-01",
      resolved_at: null,
    }]);
    const res = await handler(makeRequest("GET", { token: VALID_TOKEN }));
    expect(res.status).toBe(200);
    const body = await getBody(res);
    expect(body.data.status).toBe("completed");
    expect(body.data.inferences).toHaveLength(1);
    expect(body.data.startedAt).toBeTruthy();
  });
});
