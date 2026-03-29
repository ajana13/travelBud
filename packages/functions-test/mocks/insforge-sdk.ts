type MockUser = { id: string; [key: string]: unknown } | null;
type Row = Record<string, unknown>;

let _mockUser: MockUser = null;
let _lastOpts: Record<string, unknown> | null = null;
const _tables: Map<string, Row[]> = new Map();

// ─── Auth helpers ───────────────────────────────────────────────────────────

export function setMockUser(user: MockUser) {
  _mockUser = user;
}

export function getLastCreateClientOpts() {
  return _lastOpts;
}

// ─── DB helpers ─────────────────────────────────────────────────────────────

export function seedTable(table: string, rows: Row[]) {
  _tables.set(table, rows.map((r) => ({ ...r })));
}

export function getTableData(table: string): Row[] | undefined {
  const rows = _tables.get(table);
  return rows ? rows.map((r) => ({ ...r })) : undefined;
}

// ─── Reset ──────────────────────────────────────────────────────────────────

export function resetMock() {
  _mockUser = null;
  _lastOpts = null;
  _tables.clear();
}

// ─── Query builder ──────────────────────────────────────────────────────────

type QueryResult = { data: Row | Row[] | null; error: { message: string } | null };

function getRows(table: string): Row[] {
  return (_tables.get(table) || []).map((r) => ({ ...r }));
}

function ensureTable(table: string): Row[] {
  if (!_tables.has(table)) {
    _tables.set(table, []);
  }
  return _tables.get(table)!;
}

interface QueryBuilder {
  select(columns: string): QueryBuilder;
  eq(column: string, value: unknown): QueryBuilder;
  order(column: string, opts?: { ascending?: boolean }): QueryBuilder;
  limit(count: number): QueryBuilder;
  single(): Promise<QueryResult>;
  maybeSingle(): Promise<QueryResult>;
  then(resolve: (value: QueryResult) => void, reject?: (reason: unknown) => void): void;
}

function createSelectBuilder(table: string): QueryBuilder {
  const filters: Array<{ col: string; val: unknown }> = [];
  let orderCol: string | null = null;
  let orderAsc = true;
  let limitCount: number | null = null;

  function applyFilters(rows: Row[]): Row[] {
    let result = rows;
    for (const f of filters) {
      result = result.filter((r) => r[f.col] === f.val);
    }
    if (orderCol !== null) {
      const col = orderCol;
      result.sort((a, b) => {
        const av = a[col] as number;
        const bv = b[col] as number;
        return orderAsc ? av - bv : bv - av;
      });
    }
    if (limitCount !== null) {
      result = result.slice(0, limitCount);
    }
    return result;
  }

  const builder: QueryBuilder = {
    select(_columns: string) {
      return builder;
    },
    eq(column: string, value: unknown) {
      filters.push({ col: column, val: value });
      return builder;
    },
    order(column: string, opts?: { ascending?: boolean }) {
      orderCol = column;
      orderAsc = opts?.ascending !== false;
      return builder;
    },
    limit(count: number) {
      limitCount = count;
      return builder;
    },
    async single(): Promise<QueryResult> {
      const rows = applyFilters(getRows(table));
      if (rows.length === 0) {
        return { data: null, error: { message: "No rows found" } };
      }
      return { data: rows[0], error: null };
    },
    async maybeSingle(): Promise<QueryResult> {
      const rows = applyFilters(getRows(table));
      if (rows.length === 0) {
        return { data: null, error: null };
      }
      return { data: rows[0], error: null };
    },
    then(resolve, reject) {
      try {
        const rows = applyFilters(getRows(table));
        resolve({ data: rows, error: null });
      } catch (e) {
        if (reject) reject(e);
      }
    },
  };
  return builder;
}

interface MutationBuilder {
  select(columns: string): MutationBuilder;
  eq(column: string, value: unknown): MutationBuilder;
  single(): Promise<QueryResult>;
  maybeSingle(): Promise<QueryResult>;
  then(resolve: (value: QueryResult) => void, reject?: (reason: unknown) => void): void;
}

function createInsertBuilder(table: string, values: Row | Row[]): MutationBuilder {
  const rows = Array.isArray(values) ? values : [values];
  const tableRows = ensureTable(table);
  const inserted = rows.map((r) => ({ ...r }));
  tableRows.push(...inserted);

  let doSelect = false;
  let doSingle = false;

  const builder: MutationBuilder = {
    select(_columns: string) {
      doSelect = true;
      return builder;
    },
    eq(_column: string, _value: unknown) {
      return builder;
    },
    async single(): Promise<QueryResult> {
      doSingle = true;
      return { data: inserted.length === 1 ? { ...inserted[0] } : null, error: null };
    },
    async maybeSingle(): Promise<QueryResult> {
      return { data: inserted.length > 0 ? { ...inserted[0] } : null, error: null };
    },
    then(resolve, reject) {
      try {
        resolve({ data: doSelect ? inserted.map((r) => ({ ...r })) : null, error: null });
      } catch (e) {
        if (reject) reject(e);
      }
    },
  };
  return builder;
}

function createUpdateBuilder(table: string, values: Row): MutationBuilder {
  const filters: Array<{ col: string; val: unknown }> = [];
  let doSelect = false;

  const applyUpdate = (): Row[] => {
    const tableRows = ensureTable(table);
    const updated: Row[] = [];
    for (let i = 0; i < tableRows.length; i++) {
      let match = true;
      for (const f of filters) {
        if (tableRows[i][f.col] !== f.val) {
          match = false;
          break;
        }
      }
      if (match) {
        tableRows[i] = { ...tableRows[i], ...values };
        updated.push({ ...tableRows[i] });
      }
    }
    return updated;
  };

  const builder: MutationBuilder = {
    select(_columns: string) {
      doSelect = true;
      return builder;
    },
    eq(column: string, value: unknown) {
      filters.push({ col: column, val: value });
      return builder;
    },
    async single(): Promise<QueryResult> {
      const updated = applyUpdate();
      return { data: updated.length > 0 ? updated[0] : null, error: null };
    },
    async maybeSingle(): Promise<QueryResult> {
      const updated = applyUpdate();
      return { data: updated.length > 0 ? updated[0] : null, error: null };
    },
    then(resolve, reject) {
      try {
        const updated = applyUpdate();
        resolve({ data: doSelect ? updated : null, error: null });
      } catch (e) {
        if (reject) reject(e);
      }
    },
  };
  return builder;
}

function createDeleteBuilder(table: string): MutationBuilder {
  const filters: Array<{ col: string; val: unknown }> = [];

  const applyDelete = () => {
    const tableRows = ensureTable(table);
    const remaining: Row[] = [];
    for (const row of tableRows) {
      let match = true;
      for (const f of filters) {
        if (row[f.col] !== f.val) {
          match = false;
          break;
        }
      }
      if (!match) {
        remaining.push(row);
      }
    }
    _tables.set(table, remaining);
  };

  const builder: MutationBuilder = {
    select(_columns: string) {
      return builder;
    },
    eq(column: string, value: unknown) {
      filters.push({ col: column, val: value });
      return builder;
    },
    async single(): Promise<QueryResult> {
      applyDelete();
      return { data: null, error: null };
    },
    async maybeSingle(): Promise<QueryResult> {
      applyDelete();
      return { data: null, error: null };
    },
    then(resolve, reject) {
      try {
        applyDelete();
        resolve({ data: null, error: null });
      } catch (e) {
        if (reject) reject(e);
      }
    },
  };
  return builder;
}

function createUpsertBuilder(table: string, values: Row | Row[]): MutationBuilder {
  const rows = Array.isArray(values) ? values : [values];
  const tableRows = ensureTable(table);

  for (const row of rows) {
    const idx = tableRows.findIndex((r) => r.id === row.id);
    if (idx >= 0) {
      tableRows[idx] = { ...tableRows[idx], ...row };
    } else {
      tableRows.push({ ...row });
    }
  }

  let doSelect = false;

  const builder: MutationBuilder = {
    select(_columns: string) {
      doSelect = true;
      return builder;
    },
    eq(_column: string, _value: unknown) {
      return builder;
    },
    async single(): Promise<QueryResult> {
      return { data: rows.length === 1 ? { ...rows[0] } : null, error: null };
    },
    async maybeSingle(): Promise<QueryResult> {
      return { data: rows.length > 0 ? { ...rows[0] } : null, error: null };
    },
    then(resolve, reject) {
      try {
        resolve({ data: doSelect ? rows.map((r) => ({ ...r })) : null, error: null });
      } catch (e) {
        if (reject) reject(e);
      }
    },
  };
  return builder;
}

// ─── Client factory ─────────────────────────────────────────────────────────

export function createClient(opts: Record<string, unknown>) {
  _lastOpts = { ...opts };
  return {
    auth: {
      async getCurrentUser() {
        return { data: _mockUser ? { user: _mockUser } : null };
      },
    },
    database: {
      from(table: string) {
        return {
          select(columns: string) {
            return createSelectBuilder(table).select(columns);
          },
          insert(values: Row | Row[]) {
            return createInsertBuilder(table, values);
          },
          update(values: Row) {
            return createUpdateBuilder(table, values);
          },
          delete() {
            return createDeleteBuilder(table);
          },
          upsert(values: Row | Row[]) {
            return createUpsertBuilder(table, values);
          },
        };
      },
    },
  };
}
