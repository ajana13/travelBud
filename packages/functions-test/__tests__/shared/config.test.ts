import { describe, it, expect } from "vitest";
import { getConfig } from "../../../../insforge/functions/_shared/config.ts";

describe("config helper", () => {
  describe("getConfig()", () => {
    it("returns INSFORGE_BASE_URL from Deno.env", () => {
      const config = getConfig();
      expect(config.baseUrl).toBe("https://test.insforge.app");
    });

    it("returns ANON_KEY from Deno.env", () => {
      const config = getConfig();
      expect(config.anonKey).toBe("test-anon-key");
    });
  });
});
