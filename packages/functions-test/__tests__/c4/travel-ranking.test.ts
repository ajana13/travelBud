import { describe, it, expect, beforeEach } from "vitest";
import { getCandidates } from "../../../../insforge/functions/_shared/recommendation-service.ts";
import { createDefaultSnapshot } from "./fixtures.ts";
import { seedTable, resetMock } from "../../mocks/insforge-sdk.ts";

beforeEach(() => resetMock());

describe("C4: travel-state structural readiness", () => {
  it("default snapshot has correct travelState fields", () => {
    const snap = createDefaultSnapshot("travel-user");
    expect(snap.travelState.isAway).toBe(false);
    expect(snap.travelState.currentLocation).toBeNull();
    expect(snap.travelState.homeLocation).toEqual({ lat: 47.6062, lng: -122.3321 });
  });

  it("getCandidates returns all active inventory regardless of location", async () => {
    seedTable("inventory_items", [
      { id: "i1", pillar: "events", title: "A", tags: [], active: true, location_lat: 47.6, location_lng: -122.3, price_band: "mid", social_mode: "group", time_shape: "evening", nightlife: false, location_address: "x", location_neighborhood: "Capitol Hill" },
      { id: "i2", pillar: "dining", title: "B", tags: [], active: true, location_lat: 34.05, location_lng: -118.24, price_band: "mid", social_mode: "duo", time_shape: "lunch", nightlife: false, location_address: "y", location_neighborhood: "Downtown LA" },
      { id: "i3", pillar: "outdoors", title: "C", tags: [], active: false, location_lat: 47.6, location_lng: -122.3, price_band: "free", social_mode: "any", time_shape: "morning", nightlife: false, location_address: "z", location_neighborhood: "Ballard" },
    ]);
    const candidates = await getCandidates();
    expect(candidates).toHaveLength(2);
    expect(candidates.map((c) => c.id).sort()).toEqual(["i1", "i2"]);
  });

  it("travelState can represent away state", () => {
    const snap = createDefaultSnapshot("away-user");
    snap.travelState.isAway = true;
    snap.travelState.currentLocation = { lat: 34.05, lng: -118.24 };
    expect(snap.travelState.isAway).toBe(true);
    expect(snap.travelState.currentLocation).toEqual({ lat: 34.05, lng: -118.24 });
    expect(snap.travelState.homeLocation).toEqual({ lat: 47.6062, lng: -122.3321 });
  });
});
