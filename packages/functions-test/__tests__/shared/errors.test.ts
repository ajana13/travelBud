import { describe, it, expect } from "vitest";
import { AppError, isAppError, toErrorResponse } from "../../../../insforge/functions/_shared/errors.ts";

describe("errors helper", () => {
  describe("AppError", () => {
    it("creates an error with code, message, and status", () => {
      const err = new AppError("VALIDATION_ERROR", "Bad input", 400);
      expect(err).toBeInstanceOf(Error);
      expect(err.code).toBe("VALIDATION_ERROR");
      expect(err.message).toBe("Bad input");
      expect(err.status).toBe(400);
    });
  });

  describe("isAppError()", () => {
    it("returns true for AppError instances", () => {
      expect(isAppError(new AppError("X", "y", 400))).toBe(true);
    });

    it("returns false for plain Error", () => {
      expect(isAppError(new Error("plain"))).toBe(false);
    });
  });

  describe("toErrorResponse()", () => {
    it("converts AppError to a Response with correct status", async () => {
      const err = new AppError("NOT_FOUND", "Item missing", 404);
      const res = toErrorResponse(err, {});
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error.code).toBe("NOT_FOUND");
    });

    it("converts unknown error to 500", async () => {
      const res = toErrorResponse(new Error("boom"), {});
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error.code).toBe("INTERNAL_ERROR");
    });
  });
});
