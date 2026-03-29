import { describe, it, expect } from "vitest";
import { validateAvailability } from "../../../../insforge/functions/_shared/inventory/availability-validator.ts";

describe("availability-validator", () => {
  it("returns valid for future availability", () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    const result = validateAvailability({ start: future, end: null, recurring: false });
    expect(result.valid).toBe(true);
  });

  it("returns valid for recurring availability regardless of start date", () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const result = validateAvailability({ start: past, end: null, recurring: true });
    expect(result.valid).toBe(true);
  });

  it("returns invalid for past non-recurring with past end", () => {
    const past = new Date(Date.now() - 172800000).toISOString();
    const pastEnd = new Date(Date.now() - 86400000).toISOString();
    const result = validateAvailability({ start: past, end: pastEnd, recurring: false });
    expect(result.valid).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it("returns valid for past start but no end date (open-ended)", () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const result = validateAvailability({ start: past, end: null, recurring: false });
    expect(result.valid).toBe(true);
  });
});
