import { z } from "zod";

import { courseSlugs } from "@/data/courses";

/**
 * Zod validation schemas — shared verbatim by client forms and server
 * route handlers so validation rules can never drift between the two.
 */

// ─── Shared primitives ──────────────────────────────────────────────────────

/** E.164-ish phone: 8–15 digits, optional +, spaces/dashes tolerated. */
const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .pipe(z.string().regex(/^\+?\d{8,15}$/, "Enter a valid phone number with country code"));

const nameSchema = z
  .string()
  .trim()
  .min(2, "Please enter your full name")
  .max(80, "Name is too long");

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address")
  .max(160, "Email is too long");

// ─── Enums (mirror src/db/schema.ts) ────────────────────────────────────────

export const audienceTypeSchema = z.enum(["learner", "enterprise"]);
export type AudienceType = z.infer<typeof audienceTypeSchema>;

export const leadIntentSchema = z.enum(["demo", "syllabus", "callback"]);
export type LeadIntent = z.infer<typeof leadIntentSchema>;

export const currentStatusSchema = z.enum([
  "student-fresh-graduate",
  "working-it-professional",
  "domain-professional",
  "corporate-lnd",
]);
export type CurrentStatus = z.infer<typeof currentStatusSchema>;

export const currentStatusLabels: Record<CurrentStatus, string> = {
  "student-fresh-graduate": "Student / Fresh Graduate",
  "working-it-professional": "Working IT Professional",
  "domain-professional": "Domain Professional (Finance / Supply Chain / Ops)",
  "corporate-lnd": "Corporate L&D / HR",
};

export const leadStatusSchema = z.enum(["new", "contacted", "qualified", "closed"]);

export const deliveryModeSchema = z.enum(["live-virtual", "onsite-bengaluru", "hybrid"]);
export type DeliveryModeValue = z.infer<typeof deliveryModeSchema>;

// ─── Lead form (multi-step modal / inline) ──────────────────────────────────

/** Preferred joining month dropdown options (stored verbatim in the tracker). */
export const joiningMonthOptions = [
  "Immediate / This Month",
  "Next Month",
  "Within 3 Months",
] as const;

export const leadFormSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  city: z
    .string()
    .trim()
    .min(2, "Please enter your city")
    .max(80, "City name is too long"),
  joiningMonth: z
    .union([z.enum(joiningMonthOptions), z.literal("")])
    .optional()
    .transform((value) => (value ? value : undefined)),
  trackSlug: z
    .string()
    .trim()
    .refine((slug) => slug === "" || courseSlugs.includes(slug), "Select a valid track")
    .default(""),
  audienceType: audienceTypeSchema.default("learner"),
  currentStatus: currentStatusSchema,
  intent: leadIntentSchema,
  /** Page path the lead was captured on — folded into the auto-note. */
  pagePath: z.string().trim().max(200).optional(),
  utmSource: z.string().trim().max(128).optional(),
  utmMedium: z.string().trim().max(128).optional(),
  utmCampaign: z.string().trim().max(128).optional(),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;

// ─── Enterprise cohort builder consultation brief ───────────────────────────

export const enterpriseInquirySchema = z.object({
  contactName: nameSchema,
  companyName: z.string().trim().min(2, "Company name is required").max(120),
  workEmail: emailSchema,
  phone: phoneSchema,
  selectedModules: z
    .array(z.string().refine((slug) => courseSlugs.includes(slug), "Unknown module"))
    .min(1, "Select at least one module"),
  teamSize: z
    .number()
    .int()
    .min(5, "Corporate cohorts start at 5 participants")
    .max(500, "For 500+, contact us directly"),
  deliveryMode: deliveryModeSchema,
  timeline: z
    .string()
    .trim()
    .refine(
      (value) => ["immediate", "quarter", "half-year", "planning"].includes(value),
      "Select a timeline",
    ),
  notes: z.string().trim().max(2000).optional(),
});

export type EnterpriseInquiryInput = z.infer<typeof enterpriseInquirySchema>;

// ─── AI Advisor ─────────────────────────────────────────────────────────────

export const advisorRequestSchema = z.object({
  message: z.string().trim().min(1, "Ask a question").max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        content: z.string().max(4000),
      }),
    )
    .max(12)
    .default([]),
  /** Optional context from the guided 3-step flow. */
  profile: z
    .object({
      background: z.string().trim().max(200).optional(),
      codingComfort: z.enum(["none", "basic", "confident"]).optional(),
      goal: z.string().trim().max(200).optional(),
    })
    .optional(),
});

export type AdvisorRequest = z.infer<typeof advisorRequestSchema>;

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Flatten a ZodError into `{ field: message }` for form error display. */
export function getFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in fieldErrors)) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}
