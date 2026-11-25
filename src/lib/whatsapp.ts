import { siteConfig } from "@/lib/constants";
import type { Course } from "@/data/courses";

/**
 * Zero-cost WhatsApp click-to-chat routing.
 *
 * Uses the free public `wa.me` deep-link scheme — no WhatsApp Business API,
 * no per-conversation fees. Links open the user's WhatsApp (web or app)
 * with a context-rich, pre-filled message so sales starts every
 * conversation with full intent.
 */

export interface WhatsAppOptions {
  /** Override number (international format, digits only). Defaults to site number. */
  phone?: string;
}

function sanitizeNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

function buildWaMeLink(number: string, message: string): string {
  return `https://wa.me/${sanitizeNumber(number)}?text=${encodeURIComponent(message)}`;
}

/**
 * Escape hatch for callers that compose a fully custom message
 * (e.g. the enterprise cohort builder, which assembles multi-part briefs).
 */
export function buildWhatsAppUrlFromMessage(message: string, options?: WhatsAppOptions): string {
  return buildWaMeLink(options?.phone ?? siteConfig.whatsappNumber, message);
}

/** Generic message link (navbar / floating buttons). */
export function buildWhatsAppUrl(options?: WhatsAppOptions): string {
  const number = options?.phone ?? siteConfig.whatsappNumber;
  return buildWaMeLink(
    number,
    `Hi Syvaxia! I'd like to know more about your training programs.`,
  );
}

interface LeadWhatsAppInput extends WhatsAppOptions {
  fullName?: string;
  track: Pick<Course, "title" | "slug"> | null;
  intent: "demo" | "syllabus" | "callback";
  profile?: string;
}

const intentLines: Record<LeadWhatsAppInput["intent"], string> = {
  demo: "I'd like to book a free demo session",
  syllabus: "I've just requested the syllabus and have a few questions",
  callback: "I'd like a callback to discuss my options",
};

/**
 * Post-lead-capture deep link: carries the lead's context (name, track,
 * profile, intent) into the message so the conversation resumes seamlessly
 * from the confirmation screen.
 */
export function buildLeadFollowUpWhatsAppUrl(input: LeadWhatsAppInput): string {
  const number = input.phone ?? siteConfig.whatsappNumber;

  const lines = [
    "Hi Syvaxia!",
    input.fullName ? `I'm ${input.fullName}.` : "",
    input.track ? `I'm interested in the *${input.track.title}* program.` : "",
    intentLines[input.intent] + ".",
    input.profile ? `My background: ${input.profile}.` : "",
    "Could you share the next steps?",
  ].filter(Boolean);

  return buildWaMeLink(number, lines.join("\n"));
}

interface EnterpriseWhatsAppInput extends WhatsAppOptions {
  contactName?: string;
  companyName?: string;
  modules?: string[];
  teamSize?: number;
  deliveryMode?: string;
}

/** Enterprise builder → WhatsApp hand-off for L&D managers who prefer chat. */
export function buildEnterpriseWhatsAppUrl(input: EnterpriseWhatsAppInput): string {
  const number = input.phone ?? siteConfig.whatsappNumber;

  const lines = [
    "Hi Syvaxia!",
    input.contactName && input.companyName
      ? `I'm ${input.contactName} from *${input.companyName}*.`
      : "",
    input.modules?.length
      ? `We're exploring corporate training for: ${input.modules.join(", ")}.`
      : "We're exploring corporate training programs.",
    input.teamSize ? `Team size: ~${input.teamSize} participants.` : "",
    input.deliveryMode ? `Preferred delivery: ${input.deliveryMode}.` : "",
    "I'd like to schedule a consultation call.",
  ].filter(Boolean);

  return buildWaMeLink(number, lines.join("\n"));
}

/** Course page CTA: pre-filled with the specific track. */
export function buildCourseWhatsAppUrl(course: Course, options?: WhatsAppOptions): string {
  const number = options?.phone ?? siteConfig.whatsappNumber;
  return buildWaMeLink(
    number,
    [
      "Hi Syvaxia!",
      `I'm interested in the *${course.title}* program.`,
      "Could you share cohort dates and fees?",
    ].join("\n"),
  );
}
