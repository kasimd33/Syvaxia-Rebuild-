import { courses } from "@/data/courses";
import { getDb } from "@/db";
import { enterpriseInquiries } from "@/db/schema";
import {
  sendEnterpriseConfirmationEmail,
  sendEnterpriseNotificationEmail,
} from "@/lib/email";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { buildEnterpriseWhatsAppUrl } from "@/lib/whatsapp";
import { deliveryModeLabels, siteConfig } from "@/lib/constants";
import { enterpriseInquirySchema } from "@/lib/validations";
import { dispatchSalesAlert } from "@/lib/webhooks";
import type { EnterpriseApiResponse } from "@/types";

/**
 * POST /api/enterprise — corporate cohort builder consultation briefs.
 * Zod-validated → PostgreSQL insert → confirmation + internal sales
 * emails → high-priority webhook alert → WhatsApp hand-off link.
 */

export const runtime = "edge";

const RATE_LIMIT_REQUESTS = 4;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const json = (body: EnterpriseApiResponse, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export async function POST(request: Request) {
  const limit = rateLimit(
    `enterprise:${getClientIp(request.headers)}`,
    RATE_LIMIT_REQUESTS,
    RATE_LIMIT_WINDOW_MS,
  );
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

  const parsed = enterpriseInquirySchema.safeParse(body);
  if (!parsed.success) {
    return json({ ok: false, error: "Please check the highlighted fields." }, 400);
  }
  const input = parsed.data;

  // ── 1. Persist the inquiry ──
  let inquiryId: string;
  try {
    const db = getDb();
    const inserted = await db
      .insert(enterpriseInquiries)
      .values({
        contactName: input.contactName,
        companyName: input.companyName,
        workEmail: input.workEmail,
        phone: input.phone,
        selectedModules: input.selectedModules,
        teamSize: input.teamSize,
        deliveryMode: input.deliveryMode,
        timeline: input.timeline,
        notes: input.notes ?? null,
      })
      .returning({ id: enterpriseInquiries.id });
    const insertedId = inserted[0]?.id;
    if (!insertedId) throw new Error("Insert returned no id");
    inquiryId = insertedId;
  } catch (error) {
    console.error("[enterprise] DB insert failed:", error);
    return json(
      { ok: false, error: "We couldn't save your brief. Please try again, or reach us on WhatsApp." },
      500,
    );
  }

  const moduleTitles = input.selectedModules.map(
    (slug) => courses.find((course) => course.slug === slug)?.shortTitle ?? slug,
  );
  const timelineLabel = input.timeline;

  // ── 2. Emails (best-effort) ──
  const emailResults = await Promise.allSettled([
    sendEnterpriseConfirmationEmail({
      to: input.workEmail,
      contactName: input.contactName,
      companyName: input.companyName,
      moduleTitles,
      teamSize: input.teamSize,
    }),
    sendEnterpriseNotificationEmail({
      contactName: input.contactName,
      companyName: input.companyName,
      workEmail: input.workEmail,
      phone: input.phone,
      moduleTitles,
      teamSize: input.teamSize,
      deliveryMode: deliveryModeLabels[input.deliveryMode],
      timeline: timelineLabel,
      notes: input.notes,
    }),
  ]);
  for (const result of emailResults) {
    if (result.status === "rejected") {
      console.error("[enterprise] email dispatch error:", result.reason);
    }
  }

  // ── 3. High-priority webhook alert (B2B leads are the revenue line) ──
  await dispatchSalesAlert({
    title: `🏢 ENTERPRISE inquiry — ${input.companyName}`,
    subtitle: `${moduleTitles.join(", ")} · ~${input.teamSize} participants · ${deliveryModeLabels[input.deliveryMode]}`,
    fields: [
      { label: "Contact", value: input.contactName },
      { label: "Work email", value: input.workEmail },
      { label: "Phone", value: input.phone },
      { label: "Timeline", value: timelineLabel },
      ...(input.notes ? [{ label: "Notes", value: input.notes.slice(0, 300) }] : []),
    ],
  });

  // ── 4. WhatsApp hand-off ──
  const whatsappUrl = buildEnterpriseWhatsAppUrl({
    contactName: input.contactName,
    companyName: input.companyName,
    modules: moduleTitles,
    teamSize: input.teamSize,
    deliveryMode: deliveryModeLabels[input.deliveryMode],
  });

  return json({ ok: true, inquiryId, whatsappUrl }, 200);
}
