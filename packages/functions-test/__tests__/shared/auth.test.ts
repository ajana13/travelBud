import { describe, it, expect, beforeEach } from "vitest";
import {
  authenticateRequest,
  type AuthResult,
} from "../../../../insforge/functions/_shared/auth.ts";
import { setMockUser, resetMock } from "../../mocks/insforge-sdk.ts";

const VALID_TOKEN = "test-token-xyz";
const MOCK_USER = { id: "user-001", email: "user@test.com" };

beforeEach(() => resetMock());

describe("auth helper", () => {
  describe("authenticateRequest()", () => {
    it("returns error result when Authorization header is missing", async () => {
      const req = new Request("http://test.local/fn", { method: "GET" });
      const result = await authenticateRequest(req);
      expect(result.authenticated).toBe(false);
      expect(result.user).toBeNull();
      expect(result.error).toBe("UNAUTHORIZED");
    });

    it("returns error result when user is not found", async () => {
      setMockUser(null);
      const req = new Request("http://test.local/fn", {
        method: "GET",
        headers: { Authorization: `Bearer ${VALID_TOKEN}` },
      });
      const result = await authenticateRequest(req);
      expect(result.authenticated).toBe(false);
      expect(result.user).toBeNull();
      expect(result.error).toBe("UNAUTHORIZED");
    });

    it("returns success result with user on valid auth", async () => {
      setMockUser(MOCK_USER);
      const req = new Request("http://test.local/fn", {
        method: "GET",
        headers: { Authorization: `Bearer ${VALID_TOKEN}` },
      });
      const result = await authenticateRequest(req);
      expect(result.authenticated).toBe(true);
      expect(result.user).toEqual(MOCK_USER);
      expect(result.error).toBeNull();
      expect(result.client).toBeDefined();
    });
  });
});
