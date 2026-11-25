import { Resend } from "resend";

import { getCourseBySlug, type Course } from "@/data/courses";
import { getServerEnv } from "@/env";
import { siteConfig } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

/**
 * Resend transactional email templates (PRD Task 3.1 / 3.2).
 * Plain-HTML templates — no React Email dependency, edge-safe.
 * Every sender resolves the API key lazily so static builds never
 * touch the email client.
 */

interface SyllabusAttachment {
  /** Base64-encoded PDF body. */
  base64Content: string;
  filename: string;
}

async function getResendClient(): Promise<Resend> {
  const { RESEND_API_KEY } = getServerEnv();
  return new Resend(RESEND_API_KEY);
}

function fromAddress(): string {
  return getServerEnv().RESEND_FROM_EMAIL;
}

function internalInbox(): string {
  return getServerEnv().LEADS_NOTIFICATION_EMAIL;
}

// ─── HTML shell ─────────────────────────────────────────────────────────────

function htmlShell(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f7fafc;font-family:Segoe UI,Arial,sans-serif;color:#0d1b2e;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr>
            <td style="background:#0d1b2e;padding:20px 28px;">
              <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.5px;">SYVAXIA</span>
              <span style="color:#6366f1;font-size:12px;"> &nbsp;Where passion meets innovation</span>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <h1 style="margin:0 0 16px;font-size:20px;line-height:1.35;">${title}</h1>
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background:#f0f5fa;padding:16px 28px;font-size:12px;color:#3d6593;">
              ${siteConfig.legalName} · ${siteConfig.address.city}, India ·
              <a href="${siteConfig.url}" style="color:#4f46e5;">${siteConfig.url}</a><br/>
              You received this email because you requested it on our website.
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function textLine(label: string, value: string): string {
  return `<p style="margin:6px 0;font-size:14px;"><strong>${label}:</strong> ${value}</p>`;
}

/** Strips HTML tags for the plain-text email part (accessibility + spam score). */
function toPlainText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h1|h2|h3|tr|div)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── Lead emails ────────────────────────────────────────────────────────────

export interface LeadConfirmationInput {
  to: string;
  fullName: string;
  intent: "demo" | "syllabus" | "callback";
  trackSlug?: string | null;
  attachment?: SyllabusAttachment;
  downloadUrl?: string;
}

const intentHeadline: Record<LeadConfirmationInput["intent"], string> = {
  demo: "Your free demo session request",
  syllabus: "Your Syvaxia syllabus",
  callback: "Your callback request",
};

/**
 * Confirmation to the lead. For syllabus intent, attaches the PDF and
 * includes a direct download link (PRD acceptance criterion: delivery < 5 s).
 */
export async function sendLeadConfirmationEmail(
  input: LeadConfirmationInput,
): Promise<{ ok: boolean; error?: string }> {
  const course = input.trackSlug ? getCourseBySlug(input.trackSlug) : undefined;
  const trackTitle = course?.title ?? "your chosen track";
  const cohort = course ? course.cohorts[0] : undefined;

  const body = [
    `<p style="margin:0 0 12px;font-size:14px;">Hi ${input.fullName},</p>`,
    input.intent === "syllabus"
      ? `<p style="margin:0 0 12px;font-size:14px;">The full syllabus for <strong>${trackTitle}</strong> is attached to this email${
          input.downloadUrl ? ` — you can also <a href="${input.downloadUrl}" style="color:#4f46e5;">download it directly</a>.` : "."
        }</p>`
      : `<p style="margin:0 0 12px;font-size:14px;">We've received your request and a Syvaxia counsellor will contact you within one business day about <strong>${trackTitle}</strong>.</p>`,
    cohort
      ? `<p style="margin:0 0 12px;font-size:14px;">Next scheduled cohort starts <strong>${formatDate(cohort.startDate)}</strong> (${cohort.timing}).</p>`
      : "",
    `<p style="margin:0 0 16px;font-size:14px;">Want a faster answer? Message us on WhatsApp anytime.</p>`,
    `<a href="${siteConfig.url}/courses${course ? `/${course.slug}` : ""}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:11px 22px;border-radius:8px;font-size:14px;font-weight:600;">View the track</a>`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const resend = await getResendClient();
    await resend.emails.send({
      from: fromAddress(),
      to: input.to,
      subject: `${intentHeadline[input.intent]} — ${siteConfig.name}`,
      html: htmlShell(intentHeadline[input.intent], body),
      text: toPlainText(htmlShell(intentHeadline[input.intent], body)),
      ...(input.attachment
        ? {
            attachments: [
              {
                content: input.attachment.base64Content,
                filename: input.attachment.filename,
                contentType: "application/pdf",
              },
            ],
          }
        : {}),
    });
    return { ok: true };
  } catch (error) {
    console.error("[email] lead confirmation failed:", error);
    return { ok: false, error: error instanceof Error ? error.message : "unknown" };
  }
}

export interface LeadNotificationInput {
  fullName: string;
  email: string;
  phone: string;
  trackSlug?: string | null;
  audienceType: "learner" | "enterprise";
  currentStatus: string;
  intent: "demo" | "syllabus" | "callback";
  utmSource?: string;
}

/** Internal sales alert with full lead details. */
export async function sendLeadNotificationEmail(
  input: LeadNotificationInput,
): Promise<{ ok: boolean; error?: string }> {
  const course = input.trackSlug ? getCourseBySlug(input.trackSlug) : undefined;

  const body = [
    textLine("Name", input.fullName),
    textLine("Email", input.email),
    textLine("Phone", input.phone),
    textLine("Track", course ? `${course.title} (${course.slug})` : "—"),
    textLine("Audience", input.audienceType),
    textLine("Profile", input.currentStatus),
    textLine("Intent", input.intent),
    input.utmSource ? textLine("UTM source", input.utmSource) : "",
    textLine("Received", new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })),
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const resend = await getResendClient();
    await resend.emails.send({
      from: fromAddress(),
      to: internalInbox(),
      replyTo: input.email,
      subject: `🔔 New ${input.audienceType} lead (${input.intent}): ${input.fullName}`,
      html: htmlShell("New lead received", body),
      text: toPlainText(htmlShell("New lead received", body)),
    });
    return { ok: true };
  } catch (error) {
    console.error("[email] lead notification failed:", error);
    return { ok: false, error: error instanceof Error ? error.message : "unknown" };
  }
}

// ─── Enterprise emails ──────────────────────────────────────────────────────

export interface EnterpriseConfirmationInput {
  to: string;
  contactName: string;
  companyName: string;
  moduleTitles: string[];
  teamSize: number;
}

export async function sendEnterpriseConfirmationEmail(
  input: EnterpriseConfirmationInput,
): Promise<{ ok: boolean; error?: string }> {
  const body = [
    `<p style="margin:0 0 12px;font-size:14px;">Hi ${input.contactName},</p>`,
    `<p style="margin:0 0 12px;font-size:14px;">Thank you — your consultation brief for <strong>${input.companyName}</strong> is with our enterprise team.</p>`,
    `<p style="margin:6px 0;font-size:14px;"><strong>Selected modules:</strong> ${input.moduleTitles.join(", ")}</p>`,
    `<p style="margin:6px 0;font-size:14px;"><strong>Team size:</strong> ~${input.teamSize} participants</p>`,
    `<p style="margin:0 0 16px;font-size:14px;">A program consultant will respond with a scoped proposal within one business day. Need it sooner? Message us on WhatsApp.</p>`,
    `<a href="${siteConfig.url}/enterprise" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:11px 22px;border-radius:8px;font-size:14px;font-weight:600;">Your brief details</a>`,
  ].join("\n");

  try {
    const resend = await getResendClient();
    await resend.emails.send({
      from: fromAddress(),
      to: input.to,
      subject: `Your Syvaxia corporate training brief — ${input.companyName}`,
      html: htmlShell("Consultation brief received", body),
      text: toPlainText(htmlShell("Consultation brief received", body)),
    });
    return { ok: true };
  } catch (error) {
    console.error("[email] enterprise confirmation failed:", error);
    return { ok: false, error: error instanceof Error ? error.message : "unknown" };
  }
}

export interface EnterpriseNotificationInput {
  contactName: string;
  companyName: string;
  workEmail: string;
  phone: string;
  moduleTitles: string[];
  teamSize: number;
  deliveryMode: string;
  timeline: string;
  notes?: string;
}

export async function sendEnterpriseNotificationEmail(
  input: EnterpriseNotificationInput,
): Promise<{ ok: boolean; error?: string }> {
  const body = [
    textLine("Company", input.companyName),
    textLine("Contact", `${input.contactName} · ${input.workEmail} · ${input.phone}`),
    textLine("Modules", input.moduleTitles.join(", ")),
    textLine("Team size", `~${input.teamSize}`),
    textLine("Delivery", input.deliveryMode),
    textLine("Timeline", input.timeline),
    input.notes ? textLine("Notes", input.notes) : "",
    textLine("Received", new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })),
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const resend = await getResendClient();
    await resend.emails.send({
      from: fromAddress(),
      to: internalInbox(),
      replyTo: input.workEmail,
      subject: `🏢 Enterprise inquiry: ${input.companyName} (~${input.teamSize} people)`,
      html: htmlShell("New enterprise consultation brief", body),
      text: toPlainText(htmlShell("New enterprise consultation brief", body)),
    });
    return { ok: true };
  } catch (error) {
    console.error("[email] enterprise notification failed:", error);
    return { ok: false, error: error instanceof Error ? error.message : "unknown" };
  }
}

/**
 * Fetches a syllabus PDF from the site origin and encodes it for Resend.
 * Returns `null` when the file is missing — the confirmation email then
 * carries the download link instead of the attachment.
 */
export async function fetchSyllabusAttachment(
  origin: string,
  course: Course,
): Promise<SyllabusAttachment | null> {
  try {
    const response = await fetch(`${origin}${course.syllabusFile}`);
    if (!response.ok) return null;

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength === 0) return null;

    let binary = "";
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }
    return {
      base64Content: btoa(binary),
      filename: course.syllabusFile.split("/").pop() ?? `${course.slug}.pdf`,
    };
  } catch {
    return null;
  }
}
