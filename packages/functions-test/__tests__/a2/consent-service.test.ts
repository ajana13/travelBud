import { describe, it, expect, beforeEach } from "vitest";
import {
  recordConsent,
  getActiveConsents,
  revokeConsent,
} from "../../../../insforge/functions/_shared/consent-service.ts";
import { seedTable, getTableData, resetMock } from "../../mocks/insforge-sdk.ts";

const USER_ID = "user-consent-001";

beforeEach(() => resetMock());

describe("consent-service", () => {
  describe("recordConsent()", () => {
    it("inserts a consent record", async () => {
      const result = await recordConsent({
        userId: USER_ID,
        consentType: "location_tracking",
        granted: true,
      });
      expect(result.error).toBeNull();
      const rows = getTableData("consent_records");
      expect(rows).toHaveLength(1);
      expect(rows![0].user_id).toBe(USER_ID);
      expect(rows![0].consent_type).toBe("location_tracking");
      expect(rows![0].granted).toBe(true);
    });
  });

  describe("getActiveConsents()", () => {
    it("returns only granted consents for the user", async () => {
      seedTable("consent_records", [
        { id: "c1", user_id: USER_ID, consent_type: "location", granted: true, revoked_at: null },
        { id: "c2", user_id: USER_ID, consent_type: "analytics", granted: true, revoked_at: null },
        { id: "c3", user_id: USER_ID, consent_type: "marketing", granted: false, revoked_at: null },
        { id: "c4", user_id: "other", consent_type: "location", granted: true, revoked_at: null },
      ]);
      const consents = await getActiveConsents(USER_ID);
      expect(consents).toHaveLength(2);
      expect(consents.every((c: any) => c.user_id === USER_ID)).toBe(true);
    });

    it("returns empty array for user with no consents", async () => {
      seedTable("consent_records", []);
      const consents = await getActiveConsents(USER_ID);
      expect(consents).toEqual([]);
    });
  });

  describe("revokeConsent()", () => {
    it("marks a consent as revoked", async () => {
      seedTable("consent_records", [
        { id: "c1", user_id: USER_ID, consent_type: "location", granted: true, revoked_at: null },
      ]);
      const result = await revokeConsent(USER_ID, "location");
      expect(result.error).toBeNull();
      const rows = getTableData("consent_records")!;
      const updated = rows.find((r: any) => r.consent_type === "location");
      expect(updated!.revoked_at).toBeTruthy();
    });
  });
});
