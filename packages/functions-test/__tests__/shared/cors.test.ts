import { describe, it, expect } from "vitest";
import { buildCorsHeaders, handlePreflight } from "../../../../insforge/functions/_shared/cors.ts";

describe("cors helper", () => {
  describe("buildCorsHeaders()", () => {
    it("returns standard CORS headers with provided methods", () => {
      const h = buildCorsHeaders(["GET", "OPTIONS"]);
      expect(h["Access-Control-Allow-Origin"]).toBe("*");
      expect(h["Access-Control-Allow-Methods"]).toBe("GET, OPTIONS");
      expect(h["Access-Control-Allow-Headers"]).toContain("Authorization");
    });

    it("joins multiple methods with comma-space", () => {
      const h = buildCorsHeaders(["GET", "POST", "OPTIONS"]);
      expect(h["Access-Control-Allow-Methods"]).toBe("GET, POST, OPTIONS");
    });
  });

  describe("handlePreflight()", () => {
    it("returns 204 with CORS headers", () => {
      const res = handlePreflight(["GET", "OPTIONS"]);
      expect(res.status).toBe(204);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    });

    it("has null body", async () => {
      const res = handlePreflight(["GET", "OPTIONS"]);
      const text = await res.text();
      expect(text).toBe("");
    });
  });
});
