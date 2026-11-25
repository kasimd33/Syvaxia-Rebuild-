import { relations } from "drizzle-orm";
import {
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Syvaxia Lead Pipeline Schema (PostgreSQL — Neon/Supabase serverless)
 * ---------------------------------------------------------------------
 * Mirrors PRD §4 while extending `leads` with audience/profile/intent
 * enums required by the dual-intent funnel.
 */

export const audienceType = pgEnum("audience_type", ["learner", "enterprise"]);

export const leadIntent = pgEnum("lead_intent", ["demo", "syllabus", "callback"]);

export const syllabusDeliveryStatus = pgEnum("syllabus_delivery_status", ["sent", "failed"]);

export const deliveryMode = pgEnum("delivery_mode", ["live-virtual", "onsite-bengaluru", "hybrid"]);

/** All incoming lead inquiries across site forms (B2C + B2B-lite). */
export const leads = pgTable(
  "leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    /** Human-readable tracker reference, e.g. `SYV-2026-0001`. */
    leadRef: varchar("lead_ref", { length: 20 }).notNull().unique(),
    /** Human-readable course title for the Excel tracker (e.g. `SAP ABAP on S/4HANA`). */
    course: text("course").notNull().default("Not specified"),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    city: varchar("city", { length: 80 }).notNull(),
    trackSlug: varchar("track_slug", { length: 64 }),
    audienceType: audienceType("audience_type").notNull().default("learner"),
    /** Self-declared profile: Student / Fresh Graduate, Working IT Professional, etc. */
    currentStatus: varchar("current_status", { length: 64 }).notNull(),
    intent: leadIntent("intent").notNull(),
    /** Tracker `Source` column — utm_source override or "Website - Syllabus" etc. */
    source: varchar("source", { length: 128 }).notNull().default("Website"),
    /** Sales pipeline stage in tracker wording, defaults to `New Lead`. */
    status: varchar("status", { length: 32 }).notNull().default("New Lead"),
    /** Target joining month picked in the form (e.g. `Next Month`), optional. */
    joiningMonth: varchar("joining_month", { length: 64 }),
    /** Sales-team entry — price quoted in INR, null until quoted. */
    priceQuoted: numeric("price_quoted", { precision: 12, scale: 2 }),
    /** Tracker `Next Follow-up Date` — defaults to the day after capture. */
    nextFollowUpDate: date("next_follow_up_date").notNull(),
    /** Auto-generated opening note + free-form call history appended by sales. */
    notes: text("notes").notNull().default(""),
    /** Which funnel tab the lead surfaced in (default `Website Leads`). */
    foundInTabs: varchar("found_in_tabs", { length: 128 }).notNull().default("Website Leads"),
    /** Auto flag on insert: `Unique` or `Duplicate` (phone/email already seen). */
    duplicateCheck: varchar("duplicate_check", { length: 16 }).notNull().default("Unique"),
    utmSource: varchar("utm_source", { length: 128 }),
    utmMedium: varchar("utm_medium", { length: 128 }),
    utmCampaign: varchar("utm_campaign", { length: 128 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("leads_created_at_idx").on(table.createdAt),
    index("leads_track_slug_idx").on(table.trackSlug),
    index("leads_email_idx").on(table.email),
  ],
);

/** High-value B2B corporate L&D consultation briefs from /enterprise. */
export const enterpriseInquiries = pgTable(
  "enterprise_inquiries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contactName: text("contact_name").notNull(),
    companyName: text("company_name").notNull(),
    workEmail: text("work_email").notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    selectedModules: jsonb("selected_modules").$type<string[]>().notNull(),
    teamSize: integer("team_size").notNull(),
    deliveryMode: deliveryMode("delivery_mode").notNull(),
    timeline: varchar("timeline", { length: 64 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("enterprise_inquiries_created_at_idx").on(table.createdAt)],
);

/** Syllabus PDF dispatch ledger — links each download to its source lead. */
export const syllabusDownloads = pgTable(
  "syllabus_downloads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    courseSlug: varchar("course_slug", { length: 64 }).notNull(),
    deliveryStatus: syllabusDeliveryStatus("delivery_status").notNull().default("sent"),
    downloadedAt: timestamp("downloaded_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("syllabus_downloads_lead_id_idx").on(table.leadId),
    index("syllabus_downloads_course_slug_idx").on(table.courseSlug),
  ],
);

export const leadsRelations = relations(leads, ({ many }) => ({
  syllabusDownloads: many(syllabusDownloads),
}));

export const syllabusDownloadsRelations = relations(syllabusDownloads, ({ one }) => ({
  lead: one(leads, { fields: [syllabusDownloads.leadId], references: [leads.id] }),
}));

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type EnterpriseInquiry = typeof enterpriseInquiries.$inferSelect;
export type NewEnterpriseInquiry = typeof enterpriseInquiries.$inferInsert;
export type SyllabusDownload = typeof syllabusDownloads.$inferSelect;
export type NewSyllabusDownload = typeof syllabusDownloads.$inferInsert;
