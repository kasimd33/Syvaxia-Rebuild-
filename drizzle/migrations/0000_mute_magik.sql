CREATE TYPE "public"."audience_type" AS ENUM('learner', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."delivery_mode" AS ENUM('live-virtual', 'onsite-bengaluru', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."lead_intent" AS ENUM('demo', 'syllabus', 'callback');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'qualified', 'closed');--> statement-breakpoint
CREATE TYPE "public"."syllabus_delivery_status" AS ENUM('sent', 'failed');--> statement-breakpoint
CREATE TABLE "enterprise_inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_name" text NOT NULL,
	"company_name" text NOT NULL,
	"work_email" text NOT NULL,
	"phone" varchar(20) NOT NULL,
	"selected_modules" jsonb NOT NULL,
	"team_size" integer NOT NULL,
	"delivery_mode" "delivery_mode" NOT NULL,
	"timeline" varchar(64) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" varchar(20) NOT NULL,
	"track_slug" varchar(64),
	"audience_type" "audience_type" DEFAULT 'learner' NOT NULL,
	"current_status" varchar(64) NOT NULL,
	"intent" "lead_intent" NOT NULL,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"utm_source" varchar(128),
	"utm_medium" varchar(128),
	"utm_campaign" varchar(128),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "syllabus_downloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"course_slug" varchar(64) NOT NULL,
	"delivery_status" "syllabus_delivery_status" DEFAULT 'sent' NOT NULL,
	"downloaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "syllabus_downloads" ADD CONSTRAINT "syllabus_downloads_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "enterprise_inquiries_created_at_idx" ON "enterprise_inquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leads_track_slug_idx" ON "leads" USING btree ("track_slug");--> statement-breakpoint
CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "syllabus_downloads_lead_id_idx" ON "syllabus_downloads" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "syllabus_downloads_course_slug_idx" ON "syllabus_downloads" USING btree ("course_slug");