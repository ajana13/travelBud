import { describe, it, expect } from "vitest";
import {
  jsonOk,
  jsonError,
  methodNotAllowed,
  unauthorized,
  notImplemented,
} from "../../../../insforge/functions/_shared/response.ts";

describe("response helpers", () => {
  describe("jsonOk()", () => {
    it("returns 200 with data envelope", async () => {
      const cors = { "Access-Control-Allow-Origin": "*" };
      const res = jsonOk({ items: [1, 2] }, cors);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toEqual({ items: [1, 2] });
      expect(body.error).toBeNull();
    });

    it("returns custom status", async () => {
      const res = jsonOk({ created: true }, {}, 201);
      expect(res.status).toBe(201);
    });
  });

  describe("jsonError()", () => {
    it("returns error envelope with given code and message", async () => {
      const res = jsonError("BAD_REQUEST", "Invalid input", {}, 400);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.data).toBeNull();
      expect(body.error.code).toBe("BAD_REQUEST");
      expect(body.error.message).toBe("Invalid input");
    });
  });

  describe("methodNotAllowed()", () => {
    it("returns 405 with METHOD_NOT_ALLOWED", async () => {
      const res = methodNotAllowed("Use POST", {});
      expect(res.status).toBe(405);
      const body = await res.json();
      expect(body.error.code).toBe("METHOD_NOT_ALLOWED");
    });
  });

  describe("unauthorized()", () => {
    it("returns 401 with UNAUTHORIZED", async () => {
      const res = unauthorized("Missing token", {});
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("notImplemented()", () => {
    it("returns 501 with NOT_IMPLEMENTED", async () => {
      const res = notImplemented("Coming soon", {});
      expect(res.status).toBe(501);
      const body = await res.json();
      expect(body.error.code).toBe("NOT_IMPLEMENTED");
    });
  });
});
