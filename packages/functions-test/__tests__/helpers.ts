import { expect } from "vitest";

export const VALID_TOKEN = "test-bearer-token-abc123";
export const MOCK_USER = { id: "user-001", email: "test@letsgo.app" };

export function makeRequest(
  method: string,
  opts?: { token?: string; body?: unknown; headers?: Record<string, string> }
): Request {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...opts?.headers,
  };
  if (opts?.token) {
    headers["Authorization"] = `Bearer ${opts.token}`;
  }
  const init: RequestInit = { method, headers };
  if (opts?.body) {
    init.body = JSON.stringify(opts.body);
  }
  return new Request("http://test.local/fn", init);
}

export async function getBody(res: Response): Promise<any> {
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export function expectCors(res: Response) {
  expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  expect(res.headers.get("Access-Control-Allow-Methods")).toBeTruthy();
  expect(res.headers.get("Access-Control-Allow-Headers")).toContain("Authorization");
}

export function expectErrorEnvelope(body: any, code: string) {
  expect(body).toHaveProperty("data", null);
  expect(body).toHaveProperty("error");
  expect(body.error).toHaveProperty("code", code);
  expect(body.error).toHaveProperty("message");
  expect(typeof body.error.message).toBe("string");
}
