import { describe, it, expect, beforeEach } from "vitest";
import handler from "../../../insforge/functions/health-check/index.ts";
import { resetMock } from "../mocks/insforge-sdk.ts";
import { makeRequest, getBody, expectCors } from "./helpers.ts";

beforeEach(() => resetMock());

describe("health-check", () => {
  it("returns 204 on OPTIONS preflight", async () => {
    const res = await handler(makeRequest("OPTIONS"));
    expect(res.status).toBe(204);
    expectCors(res);
  });

  it("returns 200 with status ok on GET", async () => {
    const res = await handler(makeRequest("GET"));
    expect(res.status).toBe(200);
    const body = await getBody(res);
    expect(body.status).toBe("ok");
    expect(body.timestamp).toBeDefined();
    expectCors(res);
  });

  it("does not require authentication", async () => {
    const res = await handler(makeRequest("GET"));
    expect(res.status).toBe(200);
  });
});
