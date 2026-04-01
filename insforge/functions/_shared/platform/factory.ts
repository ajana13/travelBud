import type { DatabasePort, AuthPort, RuntimePort } from "./ports.ts";
import { InsForgeDatabase, InsForgeAuth, InsForgeRuntime } from "./insforge.ts";

let _db: DatabasePort | null = null;
let _auth: AuthPort | null = null;
let _runtime: RuntimePort | null = null;

export function setPlatform(
  db: DatabasePort,
  auth: AuthPort,
  runtime: RuntimePort
): void {
  _db = db;
  _auth = auth;
  _runtime = runtime;
}

export function getDatabase(): DatabasePort {
  if (!_db) {
    const runtime = getRuntime();
    _db = new InsForgeDatabase(runtime);
  }
  return _db;
}

export function getAuth(): AuthPort {
  if (!_auth) {
    const runtime = getRuntime();
    _auth = new InsForgeAuth(runtime);
  }
  return _auth;
}

export function getRuntime(): RuntimePort {
  if (!_runtime) {
    _runtime = new InsForgeRuntime();
  }
  return _runtime;
}
