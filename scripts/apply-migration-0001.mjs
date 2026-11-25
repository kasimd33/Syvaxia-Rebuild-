/**
 * Applies drizzle/migrations/0001_common_turbo.sql to the configured
 * DATABASE_URL. Reads the SQL file, splits on statement-breakpoint, and
 * executes each statement in order. Safe to re-run only if no statement
 * has yet succeeded (no transaction across the Neon HTTP driver).
 *
 * Usage: node scripts/apply-migration-0001.mjs
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const raw = readFileSync("drizzle/migrations/0001_common_turbo.sql", "utf8");
const statements = raw
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

const sql = neon(process.env.DATABASE_URL);

for (const stmt of statements) {
  await sql(stmt);
  console.log("OK:", stmt.slice(0, 60).replace(/\s+/g, " "));
}
console.log(`\nApplied ${statements.length} statements.`);
