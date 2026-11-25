import { eq, or, sql } from "drizzle-orm";

import { getCourseBySlug } from "@/data/courses";
import { getDb } from "@/db";
import { leads, syllabusDownloads } from "@/db/schema";
import {
  buildAutoNote,
  buildSource,
  leadRefForSequence,
  toTrackerRow,
  tomorrowIso,
} from "@/lib/lead-tracker";
import {
  fetchSyllabusAttachment,
  sendLeadConfirmationEmail,
  sendLeadNotificationEmail,
} from "@/lib/email";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/constants";
import { dispatchTrackerRow } from "@/lib/sheets-webhook";
import { buildLeadFollowUpWhatsAppUrl } from "@/lib/whatsapp";
import { leadFormSchema } from "@/lib/validations";
import { dispatchSalesAlert } from "@/lib/webhooks";
import type { LeadApiResponse } from "@/types";

/**
 * POST /api/leads — lead capture pipeline (PRD Task 3.2/3.3/3.4).
 *
 * Zod-validated → duplicate check + sequential tracker reference →
 * PostgreSQL insert (Neon HTTP driver) → syllabus ledger + Resend
 * delivery with PDF attachment → internal sales email → instant webhook
 * alert → Excel/Sheets tracker sync → response with a WhatsApp deep link
 * for the confirmation screen.
 */

export const runtime = "edge";

const RATE_LIMIT_REQUESTS = 6;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

const json = (body: LeadApiResponse, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export async function POST(request: Request) {
  const limit = rateLimit(`leads:${getClientIp(request.headers)}`, RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW_MS);
  if (!limit.ok) {
    return json(
      { ok: false, error: "Too many submissions — please try again shortly." },
      429,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Request body must be valid JSON." }, 400);
  }

  const parsed = leadFormSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        ok: false,
        error: "Please check the highlighted fields.",
        fieldErrors: Object.fromEntries(
          parsed.error.issues.map((issue) => [issue.path[0] ?? "form", issue.message]),
        ),
      },
      400,
    );
  }
  const input = parsed.data;

  const db = getDb();
  const course = input.trackSlug === "" ? undefined : getCourseBySlug(input.trackSlug);
  const origin = new URL(request.url).origin;
  const syllabusUrl = course ? `${origin}${course.syllabusFile}` : undefined;

  // ── 0. Tracker bookkeeping: duplicate flag + sequential Lead ID ──
  let duplicateCheck: "Unique" | "Duplicate" = "Unique";
  try {
    const existing = await db
      .select({ id: leads.id })
      .from(leads)
      .where(
        or(
          eq(leads.phone, input.phone),
          sql`lower(${leads.email}) = ${input.email.toLowerCase()}`,
        ),
      )
      .limit(1);
    if (existing.length > 0) duplicateCheck = "Duplicate";
  } catch (error) {
    // A failed duplicate lookup must never block capture — default Unique.
    console.error("[leads] duplicate check failed:", error);
  }

  // ── 1. Sequential Lead ID + persist (with collision retry) ──
  // The next reference is the HIGHEST existing sequence + 1, not a row
  // count: deleted leads leave gaps in the numbering, and count-based
  // numbering eventually collides with a surviving higher reference.
  let leadId: string;
  let leadRef = "";
  try {
    const year = new Date().getFullYear();
    const rows = await db
      .select({
        maxSeq: sql<number>`coalesce(max(nullif(split_part(${leads.leadRef}, '-', 3), '')::int), 0)`,
      })
      .from(leads)
      .where(sql`${leads.leadRef} like ${`SYV-${year}-%`}`);
    const baseSeq = (rows[0]?.maxSeq ?? 0) + 1;

    // Two requests landing at the same instant can pick the same
    // reference — on a unique violation, just try the next number.
    let insertedId: string | undefined;
    let lastError: unknown = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      leadRef = leadRefForSequence(year, baseSeq + attempt);
      try {
        const inserted = await db
          .insert(leads)
          .values({
            leadRef,
            course: course?.title ?? "Not specified",
            fullName: input.fullName,
            email: input.email,
            phone: input.phone,
            city: input.city,
            trackSlug: input.trackSlug === "" ? null : input.trackSlug,
            audienceType: input.audienceType,
            currentStatus: input.currentStatus,
            intent: input.intent,
            source: buildSource(input.intent, input.utmSource),
            status: "New Lead",
            joiningMonth: input.joiningMonth ?? null,
            priceQuoted: null,
            nextFollowUpDate: tomorrowIso(),
            notes: buildAutoNote({
              intent: input.intent,
              currentStatus: input.currentStatus,
              pagePath: input.pagePath,
            }),
            foundInTabs: "Website Leads",
            duplicateCheck,
            utmSource: input.utmSource ?? null,
            utmMedium: input.utmMedium ?? null,
            utmCampaign: input.utmCampaign ?? null,
          })
          .returning({ id: leads.id });
        const id = inserted[0]?.id;
        if (!id) throw new Error("Insert returned no id");
        insertedId = id;
        break;
      } catch (error) {
        lastError = error;
        if ((error as { code?: string })?.code !== "23505") throw error;
        // unique violation on leadRef — retry with the next sequence
      }
    }
    if (!insertedId) throw lastError ?? new Error("Lead insert failed");
    leadId = insertedId;
  } catch (error) {
    console.error("[leads] lead persist failed:", error);
    return json(
      { ok: false, error: "We couldn't save your request. Please try again, or reach us on WhatsApp." },
      500,
    );
  }

  // ── 2. Syllabus delivery (gated download flow) ──
  let attachment = null;
  if (input.intent === "syllabus" && course) {
    attachment = await fetchSyllabusAttachment(origin, course);

    // Ledger entry records whether the PDF actually shipped.
    try {
      await db.insert(syllabusDownloads).values({
        leadId,
        courseSlug: course.slug,
        deliveryStatus: attachment ? "sent" : "failed",
      });
    } catch (error) {
      console.error("[leads] syllabus ledger insert failed:", error);
    }
  }

  // ── 3. Emails (lead confirmation + internal sales alert) ──
  // Best-effort: a Resend outage must not lose the captured lead.
  const emailResults = await Promise.allSettled([
    sendLeadConfirmationEmail({
      to: input.email,
      fullName: input.fullName,
      intent: input.intent,
      trackSlug: input.trackSlug === "" ? null : input.trackSlug,
      attachment: attachment ?? undefined,
      downloadUrl: syllabusUrl,
    }),
    sendLeadNotificationEmail({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      trackSlug: input.trackSlug === "" ? null : input.trackSlug,
      audienceType: input.audienceType,
      currentStatus: input.currentStatus,
      intent: input.intent,
      utmSource: input.utmSource,
    }),
  ]);
  for (const result of emailResults) {
    if (result.status === "rejected") console.error("[leads] email dispatch error:", result.reason);
  }

  // ── 4. Instant sales webhook ──
  await dispatchSalesAlert({
    title: `🔔 New ${input.audienceType} lead — ${input.intent.toUpperCase()} (${leadRef}${duplicateCheck === "Duplicate" ? " · DUPLICATE" : ""})`,
    subtitle: course ? course.title : "No specific track",
    fields: [
      { label: "Name", value: input.fullName },
      { label: "Email", value: input.email },
      { label: "Phone", value: input.phone },
      { label: "City", value: input.city },
      { label: "Profile", value: input.currentStatus },
      { label: "Source", value: input.utmSource ?? "direct" },
    ],
  });

  // ── 5. Excel / Google Sheets tracker sync (exact 15-column row) ──
  const saved = await db
    .select()
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);
  if (saved[0]) {
    await dispatchTrackerRow(toTrackerRow(saved[0]));
  }

  // ── 6. WhatsApp deep link for the confirmation screen ──
  const whatsappUrl = buildLeadFollowUpWhatsAppUrl({
    fullName: input.fullName,
    track: course ?? null,
    intent: input.intent,
  });

  return json(
    {
      ok: true,
      leadId,
      leadRef,
      syllabusUrl: input.intent === "syllabus" && course ? syllabusUrl : undefined,
      whatsappUrl,
    },
    200,
  );
}
