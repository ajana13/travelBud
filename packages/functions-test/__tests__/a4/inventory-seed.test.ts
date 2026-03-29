import { describe, it, expect, beforeEach } from "vitest";
import handler from "../../../../insforge/functions/inventory-seed/index.ts";
import { resetMock, getTableData } from "../../mocks/insforge-sdk.ts";
import { makeRequest, getBody, expectCors } from "../helpers.ts";

beforeEach(() => resetMock());

describe("inventory-seed edge function", () => {
  it("returns 204 on OPTIONS", async () => {
    const res = await handler(makeRequest("OPTIONS"));
    expect(res.status).toBe(204);
  });

  it("returns 405 on wrong method (GET)", async () => {
    const res = await handler(makeRequest("GET"));
    expect(res.status).toBe(405);
  });

  it("seeds 30 inventory items on POST", async () => {
    const res = await handler(makeRequest("POST"));
    expect(res.status).toBe(200);
    const body = await getBody(res);
    expect(body.data.seeded).toBe(30);
    expectCors(res);
    const rows = getTableData("inventory_items");
    expect(rows).toHaveLength(30);
  });
});
