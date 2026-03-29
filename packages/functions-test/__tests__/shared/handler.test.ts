import { describe, it, expect, beforeEach } from "vitest";
import { createHandler } from "../../../../insforge/functions/_shared/handler.ts";
import { setMockUser, resetMock } from "../../mocks/insforge-sdk.ts";

const VALID_TOKEN = "handler-test-token";
const MOCK_USER = { id: "user-handler", email: "handler@test.com" };

beforeEach(() => resetMock());

describe("handler helper", () => {
  describe("createHandler()", () => {
    it("responds 204 on OPTIONS preflight", async () => {
      const handler = createHandler({
        methods: ["GET"],
        requireAuth: false,
        handle: async () => new Response("ok"),
      });
      const req = new Request("http://test.local/fn", { method: "OPTIONS" });
      const res = await handler(req);
      expect(res.status).toBe(204);
    });

    it("responds 405 on disallowed method", async () => {
      const handler = createHandler({
        methods: ["POST"],
        requireAuth: false,
        handle: async () => new Response("ok"),
      });
      const req = new Request("http://test.local/fn", { method: "GET" });
      const res = await handler(req);
      expect(res.status).toBe(405);
    });

    it("responds 401 when auth required and no token", async () => {
      const handler = createHandler({
        methods: ["GET"],
        requireAuth: true,
        handle: async () => new Response("ok"),
      });
      const req = new Request("http://test.local/fn", { method: "GET" });
      const res = await handler(req);
      expect(res.status).toBe(401);
    });

    it("responds 401 when auth required and user not found", async () => {
      setMockUser(null);
      const handler = createHandler({
        methods: ["GET"],
        requireAuth: true,
        handle: async () => new Response("ok"),
      });
      const req = new Request("http://test.local/fn", {
        method: "GET",
        headers: { Authorization: `Bearer ${VALID_TOKEN}` },
      });
      const res = await handler(req);
      expect(res.status).toBe(401);
    });

    it("calls handle() with context when auth succeeds", async () => {
      setMockUser(MOCK_USER);
      const handler = createHandler({
        methods: ["GET"],
        requireAuth: true,
        handle: async ({ user }) => {
          return new Response(JSON.stringify({ userId: user!.id }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        },
      });
      const req = new Request("http://test.local/fn", {
        method: "GET",
        headers: { Authorization: `Bearer ${VALID_TOKEN}` },
      });
      const res = await handler(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.userId).toBe("user-handler");
    });

    it("calls handle() without auth when requireAuth is false", async () => {
      const handler = createHandler({
        methods: ["GET"],
        requireAuth: false,
        handle: async () => {
          return new Response(JSON.stringify({ public: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        },
      });
      const req = new Request("http://test.local/fn", { method: "GET" });
      const res = await handler(req);
      expect(res.status).toBe(200);
    });

    it("includes CORS headers on all responses", async () => {
      const handler = createHandler({
        methods: ["GET"],
        requireAuth: false,
        handle: async () => new Response("ok"),
      });
      const req = new Request("http://test.local/fn", { method: "GET" });
      const res = await handler(req);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    });
  });
});
