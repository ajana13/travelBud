import { describe, it, expect, beforeEach } from "vitest";
import handler from "../../../insforge/functions/health-check/index.ts";
import { getLastCreateClientOpts, resetMock } from "../mocks/insforge-sdk.ts";
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

  it("uses anonKey for client creation (not edgeFunctionToken)", async () => {
    await handler(makeRequest("GET"));
    const opts = getLastCreateClientOpts();
    expect(opts).toHaveProperty("anonKey");
    expect(opts).not.toHaveProperty("edgeFunctionToken");
  });
});
