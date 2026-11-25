import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import { getServerEnv } from "@/env";
import * as schema from "./schema";

/**
 * Serverless PostgreSQL client (Neon HTTP driver).
 *
 * The HTTP driver issues stateless one-shot queries over fetch — no TCP
 * connection pool, no websocket handshake — which is the only reliable
 * way to hit a database from Cloudflare Workers / edge runtimes without
 * cold-start timeouts.
 *
 * Note: routes using this client must declare `export const runtime = "edge"`
 * and must NOT import heavy Node-only dependencies.
 */
let _db: ReturnType<typeof createDb> | null = null;

function createDb() {
  const { DATABASE_URL } = getServerEnv();
  const sql = neon(DATABASE_URL);
  return drizzle(sql, { schema });
}

/** Singleton Drizzle instance for edge/serverless route handlers. */
export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}

export { schema };
