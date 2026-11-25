ALTER TABLE "leads" ALTER COLUMN "status" SET DATA TYPE varchar(32);--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "status" SET DEFAULT 'New Lead';--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "lead_ref" varchar(20);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "course" text DEFAULT 'Not specified' NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "city" varchar(80);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "source" varchar(128) DEFAULT 'Website' NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "joining_month" varchar(64);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "price_quoted" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "next_follow_up_date" date;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "notes" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "found_in_tabs" varchar(128) DEFAULT 'Website Leads' NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "duplicate_check" varchar(16) DEFAULT 'Unique' NOT NULL;--> statement-breakpoint
-- Backfill existing rows before enforcing NOT NULL
UPDATE "leads" SET
  "lead_ref" = 'SYV-' || EXTRACT(YEAR FROM "created_at")::text || '-' || LPAD(seq.rn::text, 4, '0'),
  "city" = 'Unknown',
  "next_follow_up_date" = ("created_at" AT TIME ZONE 'UTC')::date + 1
FROM (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "created_at") AS rn FROM "leads"
) AS seq
WHERE "leads"."id" = seq."id";--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "lead_ref" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "city" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "next_follow_up_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_lead_ref_unique" UNIQUE("lead_ref");--> statement-breakpoint
DROP TYPE "public"."lead_status";