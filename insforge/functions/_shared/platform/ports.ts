// ─── Query Result ───────────────────────────────────────────────────────────

export interface QueryResult {
  data: Record<string, unknown> | Record<string, unknown>[] | null;
  error: { message: string } | null;
}

// ─── Query Builder (SELECT) ─────────────────────────────────────────────────

export interface QueryBuilder {
  select(columns: string): QueryBuilder;
  eq(column: string, value: unknown): QueryBuilder;
  order(column: string, opts?: { ascending?: boolean }): QueryBuilder;
  limit(count: number): QueryBuilder;
  single(): Promise<QueryResult>;
  maybeSingle(): Promise<QueryResult>;
  then(resolve: (v: QueryResult) => void, reject?: (e: unknown) => void): void;
}

// ─── Mutation Builder (INSERT/UPDATE/DELETE/UPSERT) ─────────────────────────

export interface MutationBuilder {
  select(columns: string): MutationBuilder;
  eq(column: string, value: unknown): MutationBuilder;
  single(): Promise<QueryResult>;
  maybeSingle(): Promise<QueryResult>;
  then(resolve: (v: QueryResult) => void, reject?: (e: unknown) => void): void;
}

// ─── Table Handle ───────────────────────────────────────────────────────────

export interface TableHandle {
  select(columns: string): QueryBuilder;
  insert(values: Record<string, unknown> | Record<string, unknown>[]): MutationBuilder;
  update(values: Record<string, unknown>): MutationBuilder;
  delete(): MutationBuilder;
  upsert(values: Record<string, unknown> | Record<string, unknown>[]): MutationBuilder;
}

// ─── Database Port ──────────────────────────────────────────────────────────

export interface DatabasePort {
  from(table: string): TableHandle;
}

// ─── Auth Port ──────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  [key: string]: unknown;
}

export interface AuthResult {
  authenticated: boolean;
  user: AuthUser | null;
  error: string | null;
}

export interface AuthPort {
  authenticateRequest(req: Request): Promise<AuthResult>;
}

// ─── Runtime Port ───────────────────────────────────────────────────────────

export interface RuntimePort {
  getEnv(key: string): string | undefined;
}
