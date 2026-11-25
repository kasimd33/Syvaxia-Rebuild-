import { desc } from "drizzle-orm";

import { getDb } from "@/db";
import { leads } from "@/db/schema";
import { toTrackerRow, trackerRowsToCsv } from "@/lib/lead-tracker";

/**
 * GET /api/leads/export — admin CSV export of every lead in the exact
 * 15-column Excel tracker format (headers + order), downloadable
 * directly into Microsoft Excel.
 *
 * Protected by `ADMIN_EXPORT_KEY` via `?key=` or `Authorization: Bearer`.
 * With no key provisioned the route returns 503 so it can never be open
 * by accident in production.
 */

export const runtime = "edge";

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

function isAuthorized(request: Request): boolean {
  const adminKey = process.env.ADMIN_EXPORT_KEY;
  if (!adminKey) return false; // No key provisioned → export stays closed.

  const url = new URL(request.url);
  if (url.searchParams.get("key") === adminKey) return true;

  const header = request.headers.get("authorization");
  return header === `Bearer ${adminKey}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return json(
      { ok: false, error: process.env.ADMIN_EXPORT_KEY ? "Unauthorized." : "Export not configured." },
      process.env.ADMIN_EXPORT_KEY ? 401 : 503,
    );
  }

  const rows = await getDb().select().from(leads).orderBy(desc(leads.createdAt));
  const csv = trackerRowsToCsv(rows.map(toTrackerRow));

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="syvaxia-leads-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
