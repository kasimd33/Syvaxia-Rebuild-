import { z } from "zod";

/**
 * Runtime environment validation.
 *
 * Server-side variables are validated lazily (on first server call) so that
 * static builds and edge deployments never fail on missing secrets — only
 * the routes that genuinely need them (leads, email, AI advisor) do.
 *
 * NEXT_PUBLIC_* variables are read statically and are safe in client bundles.
 */

const serverEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .url({ message: "DATABASE_URL must be a valid Neon/Supabase PostgreSQL connection string" }),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required for syllabus delivery"),
  /** Accepts bare emails and "Display Name <email>" (Resend's from format). */
  RESEND_FROM_EMAIL: z
    .string()
    .trim()
    .refine(
      (value) => /<[^<>]+@[^<>]+>/.test(value) || z.string().email().safeParse(value).success,
      "Must be an email address or 'Display Name <email>'",
    )
    .default("Syvaxia <onboarding@resend.dev>"),
  LEADS_NOTIFICATION_EMAIL: z.string().email().default("hello@syvaxia.com"),
  SALES_WEBHOOK_URL: z.string().url().optional(),
  SALES_WEBHOOK_TYPE: z.enum(["slack", "discord", "sheets"]).default("slack"),
  /** Google Apps Script / Power Automate webhook that appends 15-column tracker rows. */
  EXCEL_WEBHOOK_URL: z
    .union([z.string().url(), z.literal("")])
    .optional()
    .transform((value) => value || undefined),
  /** Guards GET /api/leads/export — unset keeps the CSV export closed. */
  ADMIN_EXPORT_KEY: z
    .union([z.string().min(8), z.literal("")])
    .optional()
    .transform((value) => value || undefined),
  GEMINI_API_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://syvaxia.com"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

/**
 * Validates and returns server environment variables.
 * Throws a descriptive error on first use if required secrets are missing.
 */
export function getServerEnv(): ServerEnv {
  if (cachedEnv) return cachedEnv;

  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid server environment variables:\n${issues}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

/** True when AI advisor can run (Gemini key provisioned). */
export function isAdvisorEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}
