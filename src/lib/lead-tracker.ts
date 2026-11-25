import type { Lead } from "@/db/schema";
import { currentStatusLabels, type CurrentStatus } from "@/lib/validations";

/**
 * Lead tracker mapping (15-column Excel format).
 *
 * Every lead surfaces in the exact column order of the sales team's
 * spreadsheet tracker:
 *
 * `Lead ID` | `Course` | `Full Name` | `Phone` | `Email` | `City` |
 * `Source` | `Status` | `Joining Month` | `Price Quoted (₹)` |
 * `Next Follow-up Date` | `Follow-up Alert` | `Notes / Call History` |
 * `Found In Tab(s)` | `Duplicate Check`
 *
 * Used verbatim by both the Sheets/Excel webhook payload and the CSV
 * export endpoint so the two can never drift.
 */

/** The exact tracker header row, in the exact column order. */
export const TRACKER_COLUMNS = [
  "Lead ID",
  "Course",
  "Full Name",
  "Phone",
  "Email",
  "City",
  "Source",
  "Status",
  "Joining Month",
  "Price Quoted (₹)",
  "Next Follow-up Date",
  "Follow-up Alert",
  "Notes / Call History",
  "Found In Tab(s)",
  "Duplicate Check",
] as const;

export type TrackerRow = {
  "Lead ID": string;
  Course: string;
  "Full Name": string;
  Phone: string;
  Email: string;
  City: string;
  Source: string;
  Status: string;
  "Joining Month": string;
  "Price Quoted (₹)": string;
  "Next Follow-up Date": string;
  "Follow-up Alert": FollowUpAlert;
  "Notes / Call History": string;
  "Found In Tab(s)": string;
  "Duplicate Check": string;
};

export type FollowUpAlert = "Overdue" | "Due Today" | "Upcoming";

/** ISO `YYYY-MM-DD` for "today" in the sales team's timezone (IST). */
export function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

/** ISO `YYYY-MM-DD` for tomorrow (IST) — the default first follow-up. */
export function tomorrowIso(): string {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(tomorrow);
}

/**
 * `Follow-up Alert` is computed, never stored — it flips automatically as
 * the calendar moves past the follow-up date.
 */
export function computeFollowUpAlert(nextFollowUpDate: string): FollowUpAlert {
  const today = todayIso();
  if (nextFollowUpDate < today) return "Overdue";
  if (nextFollowUpDate === today) return "Due Today";
  return "Upcoming";
}

/** `Source` column: UTM overrides the intent-derived default. */
export function buildSource(
  intent: Lead["intent"],
  utmSource?: string | null,
): string {
  if (utmSource) return utmSource;
  const byIntent: Record<Lead["intent"], string> = {
    syllabus: "Website - Syllabus",
    demo: "Website - Demo",
    callback: "Website - Callback",
  };
  return byIntent[intent] ?? "Website";
}

/** Auto-generated opening note capturing intent + profile + page. */
export function buildAutoNote(input: {
  intent: Lead["intent"];
  currentStatus: CurrentStatus;
  pagePath?: string;
}): string {
  const intentLabel =
    input.intent === "syllabus"
      ? "Requested syllabus"
      : input.intent === "demo"
        ? "Booked free demo"
        : "Requested callback";
  const profile = currentStatusLabels[input.currentStatus] ?? input.currentStatus;
  const parts = [`[Website] ${intentLabel}`, `Profile: ${profile}`];
  if (input.pagePath) parts.push(`Page: ${input.pagePath}`);
  return parts.join(" | ");
}

/** Next sequential tracker reference for the current year, e.g. `SYV-2026-0007`. */
export function leadRefForSequence(year: number, sequence: number): string {
  return `SYV-${year}-${String(sequence).padStart(4, "0")}`;
}

/** Map a `leads` row to the exact 15-column tracker shape (ordered). */
export function toTrackerRow(lead: Lead): TrackerRow {
  return {
    "Lead ID": lead.leadRef,
    Course: lead.course,
    "Full Name": lead.fullName,
    Phone: lead.phone,
    Email: lead.email,
    City: lead.city,
    Source: lead.source,
    Status: lead.status,
    "Joining Month": lead.joiningMonth ?? "",
    "Price Quoted (₹)":
      lead.priceQuoted !== null && lead.priceQuoted !== undefined
        ? String(lead.priceQuoted)
        : "",
    "Next Follow-up Date": lead.nextFollowUpDate,
    "Follow-up Alert": computeFollowUpAlert(lead.nextFollowUpDate),
    "Notes / Call History": lead.notes,
    "Found In Tab(s)": lead.foundInTabs,
    "Duplicate Check": lead.duplicateCheck,
  };
}

/** RFC-4180 CSV escaping — quotes, embedded commas, and newlines. */
export function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** Full CSV file for the tracker — exact headers, exact order. */
export function trackerRowsToCsv(rows: TrackerRow[]): string {
  const header = TRACKER_COLUMNS.map(csvEscape).join(",");
  const body = rows
    .map((row) => TRACKER_COLUMNS.map((column) => csvEscape(row[column] ?? "")).join(","))
    .join("\r\n");
  // Excel opens UTF-8 CSVs (₹ symbol included) correctly with a BOM.
  return `﻿${header}\r\n${body}`;
}
