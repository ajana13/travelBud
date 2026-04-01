import { describe, it, expect, beforeEach } from "vitest";
import { processAction } from "../../../../insforge/functions/_shared/feedback-service.ts";
import { resetMock } from "../../mocks/insforge-sdk.ts";

beforeEach(() => resetMock());

describe("C4: attached follow-up eligibility", () => {
  it("pass action returns eligibleFollowUp (question available via fallback)", async () => {
    const result = await processAction(
      "user-followup",
      { recommendationId: "rec-1", actionType: "pass", reasons: ["not interested"], freeText: null },
      ["tag-a"]
    );
    expect(result.accepted).toBe(true);
    expect(result.eligibleFollowUp).not.toBeNull();
  });

  it("cant action returns eligibleFollowUp (question available via fallback)", async () => {
    const result = await processAction(
      "user-followup",
      { recommendationId: "rec-1", actionType: "cant", reasons: ["busy"], freeText: null },
      []
    );
    expect(result.accepted).toBe(true);
    expect(result.eligibleFollowUp).not.toBeNull();
  });

  it("im_in action returns eligibleFollowUp as null", async () => {
    const result = await processAction(
      "user-followup",
      { recommendationId: "rec-1", actionType: "im_in", reasons: null, freeText: null },
      ["tag-b"]
    );
    expect(result.accepted).toBe(true);
    expect(result.eligibleFollowUp).toBeNull();
  });

  it("maybe action returns eligibleFollowUp as null", async () => {
    const result = await processAction(
      "user-followup",
      { recommendationId: "rec-1", actionType: "maybe", reasons: null, freeText: null },
      ["tag-c"]
    );
    expect(result.accepted).toBe(true);
    expect(result.eligibleFollowUp).toBeNull();
  });
});
