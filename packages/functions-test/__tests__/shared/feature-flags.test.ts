import { describe, it, expect, beforeEach } from "vitest";
import { getFeatureFlag, isFeatureEnabled } from "../../../../insforge/functions/_shared/feature-flags.ts";
import { seedTable, resetMock } from "../../mocks/insforge-sdk.ts";

beforeEach(() => resetMock());

describe("feature-flags helper", () => {
  describe("getFeatureFlag()", () => {
    it("returns the flag row when it exists", async () => {
      seedTable("feature_flags", [
        { id: "1", flag_name: "dark_mode", enabled: true, rollout_pct: 100 },
      ]);
      const flag = await getFeatureFlag("dark_mode");
      expect(flag).toBeDefined();
      expect(flag!.flag_name).toBe("dark_mode");
      expect(flag!.enabled).toBe(true);
    });

    it("returns null when flag does not exist", async () => {
      seedTable("feature_flags", []);
      const flag = await getFeatureFlag("nonexistent");
      expect(flag).toBeNull();
    });
  });

  describe("isFeatureEnabled()", () => {
    it("returns true when flag exists and is enabled", async () => {
      seedTable("feature_flags", [
        { id: "1", flag_name: "boost_v2", enabled: true, rollout_pct: 100 },
      ]);
      expect(await isFeatureEnabled("boost_v2")).toBe(true);
    });

    it("returns false when flag exists but is disabled", async () => {
      seedTable("feature_flags", [
        { id: "1", flag_name: "boost_v2", enabled: false, rollout_pct: 100 },
      ]);
      expect(await isFeatureEnabled("boost_v2")).toBe(false);
    });

    it("returns false when flag does not exist", async () => {
      seedTable("feature_flags", []);
      expect(await isFeatureEnabled("missing")).toBe(false);
    });
  });
});
