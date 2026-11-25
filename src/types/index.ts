/**
 * Shared application types that span data + lib layers.
 * Course/domain types live next to their data sources
 * (`@/data/courses`, `@/data/outcomes`); only cross-cutting
 * types belong here.
 */

import type { z } from "zod";

import type {
  advisorRequestSchema,
  enterpriseInquirySchema,
  leadFormSchema,
} from "@/lib/validations";

/** API contract for POST /api/leads */
export type LeadApiRequest = z.infer<typeof leadFormSchema>;

export interface LeadApiResponse {
  ok: boolean;
  leadId?: string;
  /** Human-readable tracker reference, e.g. `SYV-2026-0001`. */
  leadRef?: string;
  syllabusUrl?: string;
  whatsappUrl?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/** API contract for POST /api/enterprise */
export type EnterpriseApiRequest = z.infer<typeof enterpriseInquirySchema>;

export interface EnterpriseApiResponse {
  ok: boolean;
  inquiryId?: string;
  whatsappUrl?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/** API contract for POST /api/advisor */
export type AdvisorApiRequest = z.infer<typeof advisorRequestSchema>;

export interface AdvisorStreamEvent {
  type: "text" | "recommendation" | "error" | "done";
  content?: string;
  recommendation?: {
    trackSlug: string;
    trackTitle: string;
    rationale: string;
    /** "ai" = Gemini, "heuristic" = offline rules-based fallback. */
    source?: "ai" | "heuristic";
  };
}
