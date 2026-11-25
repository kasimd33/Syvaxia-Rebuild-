/**
 * Finishes 0001_common_turbo: backfill + NOT NULL + unique + enum drop.
 * (The 12 ALTER/ADD statements already applied successfully.)
 *
 * Usage: node scripts/finish-migration-0001.mjs
 */
import { neon } from "@neondatabase/serverless";

const statements = [
  `UPDATE "leads" SET
    "lead_ref" = 'SYV-' || EXTRACT(YEAR FROM "created_at")::text || '-' || LPAD(seq.rn::text, 4, '0'),
    "city" = 'Unknown',
    "next_follow_up_date" = ("created_at" AT TIME ZONE 'UTC')::date + 1
  FROM (
    SELECT "id", ROW_NUMBER() OVER (ORDER BY "created_at") AS rn FROM "leads"
  ) AS seq
  WHERE "leads"."id" = seq."id"`,
  `ALTER TABLE "leads" ALTER COLUMN "lead_ref" SET NOT NULL`,
  `ALTER TABLE "leads" ALTER COLUMN "city" SET NOT NULL`,
  `ALTER TABLE "leads" ALTER COLUMN "next_follow_up_date" SET NOT NULL`,
  `ALTER TABLE "leads" ADD CONSTRAINT "leads_lead_ref_unique" UNIQUE("lead_ref")`,
  `DROP TYPE "public"."lead_status"`,
];

const sql = neon(process.env.DATABASE_URL);
for (const stmt of statements) {
  await sql(stmt);
  console.log("OK:", stmt.slice(0, 60).replace(/\s+/g, " "));
}
console.log("\nMigration 0001 complete.");
