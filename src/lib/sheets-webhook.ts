import type { TrackerRow } from "@/lib/lead-tracker";

/**
 * Zero-cost Google Sheets / Excel sync.
 *
 * On every new lead, POST an ordered JSON payload matching the exact
 * 15-column tracker format to `EXCEL_WEBHOOK_URL`. The URL is typically a
 * free Google Apps Script Web App (`doPost` → `appendRow`) but any
 * Power Automate / Make / n8n webhook accepting flat JSON works.
 *
 * Dispatch is best-effort: a sync failure is logged and never blocks
 * lead capture — the row always lands in PostgreSQL first.
 */

export async function dispatchTrackerRow(row: TrackerRow): Promise<void> {
  const url = process.env.EXCEL_WEBHOOK_URL;
  if (!url) return; // Sync not provisioned — PostgreSQL + email + sales webhook suffice.

  // Shared secret appended as a query param — Apps Script's doPost cannot
  // read request headers, so the token travels in the URL. The script
  // rejects posts whose token does not match EXCEL_WEBHOOK_SECRET.
  const secret = process.env.EXCEL_WEBHOOK_SECRET;
  const target = secret ? `${url}${url.includes("?") ? "&" : "?"}token=${encodeURIComponent(secret)}` : url;

  try {
    const response = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Send keys in tracker column order so the receiving script can
      // blindly `appendRow(Object.values(payload))`.
      body: JSON.stringify(row),
    });
    if (!response.ok) {
      console.error(`[sheets] tracker sync failed with HTTP ${response.status}`);
    }
  } catch (error) {
    console.error("[sheets] tracker sync failed:", error);
  }
}
