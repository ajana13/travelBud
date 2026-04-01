import { describe, it, expect, beforeEach } from "vitest";
import handler from "../../../insforge/functions/feed/index.ts";
import { setMockUser, resetMock, seedTable } from "../mocks/insforge-sdk.ts";
import { makeRequest, getBody, expectCors, expectErrorEnvelope, VALID_TOKEN, MOCK_USER } from "./helpers.ts";

beforeEach(() => resetMock());

describe("feed", () => {
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
    expectCors(res);
  });

  it("returns 401 when Authorization header is missing", async () => {
    const res = await handler(makeRequest("GET"));
    expect(res.status).toBe(401);
    const body = await getBody(res);
    expectErrorEnvelope(body, "UNAUTHORIZED");
    expectCors(res);
  });

  it("returns 401 when user is not found", async () => {
    setMockUser(null);
    const res = await handler(makeRequest("GET", { token: VALID_TOKEN }));
    expect(res.status).toBe(401);
    const body = await getBody(res);
    expectErrorEnvelope(body, "UNAUTHORIZED");
  });

  it("returns 200 with feed data for authenticated user", async () => {
    setMockUser(MOCK_USER);
    seedTable("inventory_items", [
      { id: "i1", pillar: "events", title: "Test Event", tags: ["music"], price_band: "mid", social_mode: "group", time_shape: "evening", nightlife: false, location_lat: 47.6, location_lng: -122.3, location_address: "123 Main", location_neighborhood: "Capitol Hill", active: true },
      { id: "i2", pillar: "dining", title: "Test Restaurant", tags: ["sushi"], price_band: "mid", social_mode: "duo", time_shape: "lunch", nightlife: false, location_lat: 47.6, location_lng: -122.3, location_address: "456 Pine", location_neighborhood: "Ballard", active: true },
      { id: "i3", pillar: "outdoors", title: "Test Hike", tags: ["hiking"], price_band: "free", social_mode: "any", time_shape: "morning", nightlife: false, location_lat: 47.6, location_lng: -122.3, location_address: "789 Trail", location_neighborhood: "Discovery Park", active: true },
    ]);
    const res = await handler(makeRequest("GET", { token: VALID_TOKEN }));
    expect(res.status).toBe(200);
    const body = await getBody(res);
    expect(body.data).toBeDefined();
    expect(body.data.cards).toBeInstanceOf(Array);
    expect(body.data.feedSize).toBe(body.data.cards.length);
    expect(body.data.generatedAt).toBeTruthy();
    expectCors(res);
  });

  it("returns empty feed when no inventory exists", async () => {
    setMockUser(MOCK_USER);
    const res = await handler(makeRequest("GET", { token: VALID_TOKEN }));
    expect(res.status).toBe(200);
    const body = await getBody(res);
    expect(body.data.cards).toHaveLength(0);
    expect(body.data.feedSize).toBe(0);
  });

  it("each card has required fields", async () => {
    setMockUser(MOCK_USER);
    seedTable("inventory_items", [
      { id: "i1", pillar: "events", title: "Event 1", tags: ["music"], price_band: "mid", social_mode: "group", time_shape: "evening", nightlife: false, location_lat: 47.6, location_lng: -122.3, location_address: "123 Main", location_neighborhood: "Capitol Hill", active: true },
      { id: "i2", pillar: "dining", title: "Restaurant 1", tags: ["sushi"], price_band: "budget", social_mode: "duo", time_shape: "lunch", nightlife: false, location_lat: 47.6, location_lng: -122.3, location_address: "456 Pine", location_neighborhood: "Ballard", active: true },
      { id: "i3", pillar: "outdoors", title: "Hike 1", tags: ["hiking"], price_band: "free", social_mode: "any", time_shape: "morning", nightlife: false, location_lat: 47.6, location_lng: -122.3, location_address: "789 Trail", location_neighborhood: "Discovery Park", active: true },
    ]);
    const res = await handler(makeRequest("GET", { token: VALID_TOKEN }));
    const body = await getBody(res);
    for (const card of body.data.cards) {
      expect(card.id).toBeTruthy();
      expect(card.itemId).toBeTruthy();
      expect(typeof card.score).toBe("number");
      expect(["new", "learning", "strong_match"]).toContain(card.confidenceLabel);
      expect(typeof card.isExploration).toBe("boolean");
      expect(Array.isArray(card.explanationFacts)).toBe(true);
      expect(typeof card.explanationText).toBe("string");
      expect(card.allowedActions).toEqual(["im_in", "maybe", "pass", "cant"]);
    }
  });
});
