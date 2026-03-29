import { describe, it, expect, beforeEach } from "vitest";
import {
  createClient,
  resetMock,
  seedTable,
  getTableData,
  setMockUser,
} from "../../mocks/insforge-sdk.ts";

beforeEach(() => resetMock());

describe("insforge-sdk mock: in-memory DB", () => {
  const client = createClient({ baseUrl: "https://test.insforge.app", anonKey: "key" });

  describe("seedTable / getTableData", () => {
    it("seeds rows that are retrievable", () => {
      seedTable("items", [{ id: "1", name: "Alpha" }]);
      expect(getTableData("items")).toHaveLength(1);
      expect(getTableData("items")![0]).toEqual({ id: "1", name: "Alpha" });
    });

    it("returns undefined for unseeded tables", () => {
      expect(getTableData("nope")).toBeUndefined();
    });

    it("resets all tables on resetMock()", () => {
      seedTable("items", [{ id: "1" }]);
      resetMock();
      expect(getTableData("items")).toBeUndefined();
    });
  });

  describe("database.from().select()", () => {
    it("selects all rows from a seeded table", async () => {
      seedTable("items", [
        { id: "1", name: "A" },
        { id: "2", name: "B" },
      ]);
      const c = createClient({ baseUrl: "x", anonKey: "k" });
      const { data, error } = await c.database.from("items").select("*");
      expect(error).toBeNull();
      expect(data).toHaveLength(2);
    });

    it("returns empty array for an empty seeded table", async () => {
      seedTable("items", []);
      const c = createClient({ baseUrl: "x", anonKey: "k" });
      const { data, error } = await c.database.from("items").select("*");
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it("returns empty array for an unseeded table", async () => {
      const c = createClient({ baseUrl: "x", anonKey: "k" });
      const { data, error } = await c.database.from("unknown_table").select("*");
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  describe("database.from().select().eq()", () => {
    it("filters rows by equality", async () => {
      seedTable("items", [
        { id: "1", pillar: "events" },
        { id: "2", pillar: "dining" },
        { id: "3", pillar: "events" },
      ]);
      const c = createClient({ baseUrl: "x", anonKey: "k" });
      const { data } = await c.database.from("items").select("*").eq("pillar", "events");
      expect(data).toHaveLength(2);
      expect(data!.every((r: any) => r.pillar === "events")).toBe(true);
    });

    it("chains multiple eq filters (AND)", async () => {
      seedTable("items", [
        { id: "1", pillar: "events", active: true },
        { id: "2", pillar: "events", active: false },
        { id: "3", pillar: "dining", active: true },
      ]);
      const c = createClient({ baseUrl: "x", anonKey: "k" });
      const db = c.database;
      const { data } = await db.from("items").select("*").eq("pillar", "events").eq("active", true);
      expect(data).toHaveLength(1);
      expect(data![0].id).toBe("1");
    });
  });

  describe("database.from().select().order()", () => {
    it("orders ascending by default", async () => {
      seedTable("items", [
        { id: "3", seq: 30 },
        { id: "1", seq: 10 },
        { id: "2", seq: 20 },
      ]);
      const c = createClient({ baseUrl: "x", anonKey: "k" });
      const db = c.database;
      const { data } = await db.from("items").select("*").order("seq", { ascending: true });
      expect(data!.map((r: any) => r.seq)).toEqual([10, 20, 30]);
    });

    it("orders descending", async () => {
      seedTable("items", [
        { id: "1", seq: 10 },
        { id: "2", seq: 20 },
      ]);
      const c = createClient({ baseUrl: "x", anonKey: "k" });
      const db = c.database;
      const { data } = await db.from("items").select("*").order("seq", { ascending: false });
      expect(data!.map((r: any) => r.seq)).toEqual([20, 10]);
    });
  });

  describe("database.from().select().limit()", () => {
    it("limits returned rows", async () => {
      seedTable("items", [{ id: "1" }, { id: "2" }, { id: "3" }]);
      const c = createClient({ baseUrl: "x", anonKey: "k" });
      const { data } = await c.database.from("items").select("*").limit(2);
      expect(data).toHaveLength(2);
    });
  });

  describe("database.from().select().single()", () => {
    it("returns a single object when exactly one match", async () => {
      seedTable("items", [{ id: "1", name: "A" }]);
      const c = createClient({ baseUrl: "x", anonKey: "k" });
      const db = c.database;
      const { data, error } = await db.from("items").select("*").eq("id", "1").single();
      expect(error).toBeNull();
      expect(data).toEqual({ id: "1", name: "A" });
    });

    it("returns error when no rows match", async () => {
      seedTable("items", []);
      const c = createClient({ baseUrl: "x", anonKey: "k" });
      const db = c.database;
      const { data, error } = await db.from("items").select("*").eq("id", "missing").single();
      expect(data).toBeNull();
      expect(error).toBeTruthy();
    });
  });

  describe("database.from().select().maybeSingle()", () => {
    it("returns data when one match", async () => {
      seedTable("items", [{ id: "1" }]);
      const c = createClient({ baseUrl: "x", anonKey: "k" });
      const db = c.database;
      const { data, error } = await db.from("items").select("*").eq("id", "1").maybeSingle();
      expect(error).toBeNull();
      expect(data).toEqual({ id: "1" });
    });

    it("returns null data when no match (no error)", async () => {
      seedTable("items", []);
      const c = createClient({ baseUrl: "x", anonKey: "k" });
      const db = c.database;
      const { data, error } = await db.from("items").select("*").eq("id", "missing").maybeSingle();
      expect(error).toBeNull();
      expect(data).toBeNull();
    });
  });

  describe("database.from().insert()", () => {
    it("inserts a single row", async () => {
      const c = createClient({ baseUrl: "x", anonKey: "k" });
      const db = c.database;
      const { data, error } = await db.from("items").insert({ id: "1", name: "New" }).select("*").single();
      expect(error).toBeNull();
      expect(data).toEqual({ id: "1", name: "New" });
      expect(getTableData("items")).toHaveLength(1);
    });

    it("inserts an array of rows", async () => {
      const c = createClient({ baseUrl: "x", anonKey: "k" });
      const db = c.database;
      const { data, error } = await db.from("items").insert([
        { id: "1", name: "A" },
        { id: "2", name: "B" },
      ]).select("*");
      expect(error).toBeNull();
      expect(data).toHaveLength(2);
      expect(getTableData("items")).toHaveLength(2);
    });

    it("appends to existing rows", async () => {
      seedTable("items", [{ id: "existing" }]);
      const c = createClient({ baseUrl: "x", anonKey: "k" });
      await c.database.from("items").insert({ id: "new" });
      expect(getTableData("items")).toHaveLength(2);
    });
  });

  describe("database.from().update()", () => {
    it("updates matching rows", async () => {
      seedTable("items", [
        { id: "1", name: "Old" },
        { id: "2", name: "Keep" },
      ]);
      const c = createClient({ baseUrl: "x", anonKey: "k" });
      const db = c.database;
      const { data, error } = await db.from("items").update({ name: "Updated" }).eq("id", "1").select("*").single();
      expect(error).toBeNull();
      expect(data).toEqual({ id: "1", name: "Updated" });
      expect(getTableData("items")!.find((r: any) => r.id === "2")!.name).toBe("Keep");
    });
  });

  describe("database.from().delete()", () => {
    it("deletes matching rows", async () => {
      seedTable("items", [
        { id: "1", name: "Del" },
        { id: "2", name: "Keep" },
      ]);
      const c = createClient({ baseUrl: "x", anonKey: "k" });
      const { error } = await c.database.from("items").delete().eq("id", "1");
      expect(error).toBeNull();
      expect(getTableData("items")).toHaveLength(1);
      expect(getTableData("items")![0].id).toBe("2");
    });
  });

  describe("database.from().upsert()", () => {
    it("inserts when no existing row", async () => {
      const c = createClient({ baseUrl: "x", anonKey: "k" });
      const { error } = await c.database.from("items").upsert({ id: "1", name: "New" });
      expect(error).toBeNull();
      expect(getTableData("items")).toHaveLength(1);
    });

    it("updates when row with same id exists", async () => {
      seedTable("items", [{ id: "1", name: "Old" }]);
      const c = createClient({ baseUrl: "x", anonKey: "k" });
      const { error } = await c.database.from("items").upsert({ id: "1", name: "Merged" });
      expect(error).toBeNull();
      expect(getTableData("items")).toHaveLength(1);
      expect(getTableData("items")![0].name).toBe("Merged");
    });
  });
});
