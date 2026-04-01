import { describe, it, expect } from "vitest";
import { updateCadence } from "../../../../insforge/functions/_shared/learning-service.ts";
import { createDefaultSnapshot } from "./fixtures.ts";

const USER = "cadence-user";

describe("C4: learning cadence", () => {
  it("starts with rate=1 (eager)", () => {
    const snap = createDefaultSnapshot(USER);
    expect(snap.cadenceState.currentRate).toBe(1);
    expect(snap.cadenceState.answeredCount).toBe(0);
    expect(snap.cadenceState.ignoredCount).toBe(0);
  });

  it("answering 3 questions keeps rate high (acceleration)", () => {
    let snap = createDefaultSnapshot(USER) as any;
    snap = updateCadence(snap, true);
    snap = updateCadence(snap, true);
    snap = updateCadence(snap, true);
    expect(snap.cadenceState.answeredCount).toBe(3);
    expect(snap.cadenceState.currentRate).toBe(1);
  });

  it("ignoring 3 questions drops rate (backoff)", () => {
    let snap = createDefaultSnapshot(USER) as any;
    snap = updateCadence(snap, false);
    snap = updateCadence(snap, false);
    snap = updateCadence(snap, false);
    expect(snap.cadenceState.ignoredCount).toBe(3);
    expect(snap.cadenceState.currentRate).toBe(0);
  });

  it("mixed answered/ignored reflects accurate ratio", () => {
    let snap = createDefaultSnapshot(USER) as any;
    snap = updateCadence(snap, true);
    snap = updateCadence(snap, true);
    snap = updateCadence(snap, false);
    snap = updateCadence(snap, true);
    expect(snap.cadenceState.answeredCount).toBe(3);
    expect(snap.cadenceState.ignoredCount).toBe(1);
    expect(snap.cadenceState.currentRate).toBe(0.75);
  });

  it("updates lastUpdatedAt on each cadence change", async () => {
    const snap = createDefaultSnapshot(USER) as any;
    const before = snap.cadenceState.lastUpdatedAt;
    await new Promise((r) => setTimeout(r, 5));
    const result = updateCadence(snap, true);
    expect(new Date(result.cadenceState.lastUpdatedAt).getTime())
      .toBeGreaterThanOrEqual(new Date(before).getTime());
  });
});
