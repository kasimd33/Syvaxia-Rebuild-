/**
 * Tests the Google Apps Script sheet webhook exactly the way
 * src/lib/sheets-webhook.ts sends it (node fetch, token in query).
 *
 * Usage: node scripts/test-sheets-webhook.mjs
 */
const url = process.env.EXCEL_WEBHOOK_URL;
const token = process.env.EXCEL_WEBHOOK_SECRET;

if (!url || !token) throw new Error("Set EXCEL_WEBHOOK_URL and EXCEL_WEBHOOK_SECRET first");

const row = {
  "Lead ID": "SYV-TEST-0001",
  "Course": "Webhook Test",
  "Full Name": "Sheet Sync Test",
  "Phone": "+919999000000",
  "Email": "sheettest@example.com",
  "City": "Bengaluru",
  "Source": "Website",
  "Status": "New Lead",
  "Joining Month": "",
  "Price Quoted (₹)": "",
  "Next Follow-up Date": "2026-11-25",
  "Follow-up Alert": "Upcoming",
  "Notes / Call History": "[Website] webhook wiring test — safe to delete this row",
  "Found In Tab(s)": "Website Leads",
  "Duplicate Check": "Unique",
};

const target = `${url}?token=${encodeURIComponent(token)}`;
const response = await fetch(target, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(row),
});
console.log("HTTP", response.status);
console.log("Response:", (await response.text()).slice(0, 200));
