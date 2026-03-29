import { describe, it, expect } from "vitest";
import {
  validateBody,
} from "../../../../insforge/functions/_shared/validation.ts";
import { z } from "zod";

const TestSchema = z.object({
  name: z.string(),
  age: z.number().int().positive(),
});

describe("validation helper", () => {
  describe("validateBody()", () => {
    it("returns parsed data for valid input", () => {
      const result = validateBody(TestSchema, { name: "Alice", age: 30 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: "Alice", age: 30 });
      }
    });

    it("returns error details for invalid input", () => {
      const result = validateBody(TestSchema, { name: 123, age: -1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it("returns error for null input", () => {
      const result = validateBody(TestSchema, null);
      expect(result.success).toBe(false);
    });
  });
});
