"use client";

import { Building2, CheckCircle2, Loader2, MessageCircle, Send, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudWatchFace } from "@/components/ui/cloud-watch-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { courses, type DeliveryMode } from "@/data/courses";
import { timelineOptions } from "@/data/enterprise";
import { deliveryModeLabels } from "@/lib/constants";
import { getFieldErrors } from "@/lib/validations";
import { buildEnterpriseWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import type { EnterpriseApiResponse } from "@/types";

/**
 * Interactive Corporate Cohort Builder.
 *
 * HR/L&D managers select target modules, drag the team-size slider
 * (5–100+), pick a delivery mode and timeline, and submit a structured
 * consultation brief to POST /api/enterprise — PostgreSQL capture,
 * Resend confirmation email, and an instant high-priority sales webhook.
 * A WhatsApp hand-off is offered at every stage as the faster channel.
 */

const MAX_TEAM_SIZE = 100;

const briefFormSchema = z.object({
  contactName: z.string().trim().min(2, "Please enter your name").max(80),
  companyName: z.string().trim().min(2, "Company name is required").max(120),
  workEmail: z.string().trim().email("Enter a valid work email"),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s()-]/g, ""))
    .pipe(z.string().regex(/^\+?\d{8,15}$/, "Enter a valid phone with country code")),
  notes: z.string().trim().max(2000).optional(),
});

type BriefFormValues = z.infer<typeof briefFormSchema>;

export function CohortBuilder() {
  // ── Builder selections ──
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [teamSize, setTeamSize] = useState(15);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("live-virtual");
  const [timeline, setTimeline] = useState<string>("");

  // ── Contact details ──
  const [contact, setContact] = useState<BriefFormValues>({
    contactName: "",
    companyName: "",
    workEmail: "",
    phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<EnterpriseApiResponse | null>(null);

  const teamSizeBand = useMemo(() => {
    if (teamSize >= MAX_TEAM_SIZE) return "100+ (custom program)";
    return `${teamSize} participants`;
  }, [teamSize]);

  const toggleModule = (slug: string) => {
    setSelectedModules((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug],
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const moduleCheck = z.array(z.string()).min(1, "Select at least one module").safeParse(selectedModules);
    const timelineCheck = z
      .string()
      .refine((value) => timelineOptions.some((option) => option.value === value), "Select a timeline")
      .safeParse(timeline);
    const contactCheck = briefFormSchema.safeParse(contact);

    if (!moduleCheck.success || !timelineCheck.success || !contactCheck.success) {
      const nextErrors: Record<string, string> = {};
      if (!moduleCheck.success) nextErrors.selectedModules = moduleCheck.error.issues[0]?.message ?? "Invalid";
      if (!timelineCheck.success) nextErrors.timeline = timelineCheck.error.issues[0]?.message ?? "Invalid";
      if (!contactCheck.success) Object.assign(nextErrors, getFieldErrors(contactCheck.error));
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const response = await fetch("/api/enterprise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...contactCheck.data,
          selectedModules,
          teamSize,
          deliveryMode,
          timeline: timelineCheck.data,
        }),
      });
      const data = (await response.json()) as EnterpriseApiResponse;

      if (!response.ok || !data.ok) {
        setErrors({
          form:
            data.error ??
            "Something went wrong while submitting your brief. Please try again, or continue on WhatsApp.",
        });
        return;
      }
      setResult(data);
    } catch {
      setErrors({
        form: "Couldn't reach our server. Please try again, or continue on WhatsApp.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (key: string) =>
    errors[key] ? (
      <p id={`${key}-error`} role="alert" className="text-xs text-destructive">
        {errors[key]}
      </p>
    ) : null;

  return (
    <Card className="overflow-hidden border-brand-200 shadow-glow">
      <CardHeader className="border-b bg-brand-50 dark:bg-brand-900/30">
        <CardTitle className="flex items-center gap-2 font-display text-xl">
          <Building2 className="size-5 text-brand-600" aria-hidden />
          Build Your Corporate Cohort
        </CardTitle>
        <CardDescription>
          Configure your program in 60 seconds — we respond with a scoped proposal and pricing.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8 p-6">
        {/* Success panel — brief captured, emails + webhook dispatched server-side */}
        {result?.ok && (
          <div className="space-y-4 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-center dark:border-emerald-800 dark:bg-emerald-900/30">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <CheckCircle2 className="size-7 text-emerald-600" aria-hidden />
            </div>
            <div>
              <p className="font-display text-lg font-bold">Brief received!</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                A program consultant will respond with a scoped proposal within one business day.
                Reference ID:{" "}
                <span className="font-mono text-xs">{result.inquiryId?.slice(0, 8)}</span>
              </p>
            </div>
            {result.whatsappUrl && (
              <Button variant="brand" asChild className="w-full gap-2">
                <a href={result.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" />
                  Fast-track on WhatsApp
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setResult(null)}
              className="w-full"
            >
              Submit another brief
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* Step 1 — modules */}
          <fieldset>
            <legend className="font-semibold">
              <span className="mr-2 font-mono text-sm text-brand-600">01</span>
              Target modules
            </legend>
            <p className="mb-3 mt-1 text-sm text-muted-foreground">
              Pick one or mix tracks for cross-functional teams.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {courses.map((course) => {
                const selected = selectedModules.includes(course.slug);
                return (
                  <button
                    key={course.slug}
                    type="button"
                    aria-pressed={selected}
                    aria-describedby={errors.selectedModules ? "selectedModules-error" : undefined}
                    onClick={() => toggleModule(course.slug)}
                    className={cn(
                      "flex min-h-[56px] items-center justify-between gap-3 rounded-lg border p-3 text-left text-sm transition-all",
                      selected
                        ? "border-brand-600 bg-brand-50 shadow-sm dark:bg-brand-900/30"
                        : "border-border bg-background hover:border-brand-300",
                    )}
                  >
                    <span>
                      <span className="block font-medium">{course.shortTitle}</span>
                      <span className="block text-xs text-muted-foreground">
                        {course.durationWeeks} weeks · {courseCategoryLabel(course.category)}
                      </span>
                    </span>
                    {selected && (
                      <CheckCircle2 className="size-5 shrink-0 text-brand-600" aria-hidden />
                    )}
                  </button>
                );
              })}
            </div>
            {fieldError("selectedModules")}
          </fieldset>

          {/* Step 2 — team size */}
          <fieldset>
            <legend className="font-semibold">
              <span className="mr-2 font-mono text-sm text-brand-600">02</span>
              Team size
            </legend>
            <div className="mt-4 flex items-center gap-4">
              <Users className="size-5 shrink-0 text-brand-600" aria-hidden />
              <Slider
                value={[teamSize]}
                onValueChange={(values: number[]) => setTeamSize(values[0] ?? teamSize)}
                min={5}
                max={MAX_TEAM_SIZE}
                step={1}
                aria-label="Team size"
              />
              <span className="w-44 shrink-0 text-right font-mono text-sm font-semibold text-brand-700 dark:text-brand-300">
                {teamSizeBand}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Corporate cohorts start at 5 participants. For 100+, we scope a multi-batch program.
            </p>
          </fieldset>

          {/* Step 3 — delivery mode + timeline */}
          <fieldset>
            <legend className="font-semibold">
              <span className="mr-2 font-mono text-sm text-brand-600">03</span>
              Delivery mode & timeline
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Delivery mode">
              {(Object.keys(deliveryModeLabels) as DeliveryMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={deliveryMode === mode}
                  onClick={() => setDeliveryMode(mode)}
                  className={cn(
                    "min-h-[52px] rounded-lg border p-3 text-sm font-medium transition-all",
                    deliveryMode === mode
                      ? "border-brand-600 bg-brand-50 text-brand-800 shadow-sm dark:bg-brand-900/30 dark:text-brand-200"
                      : "border-border bg-background text-muted-foreground hover:border-brand-300",
                  )}
                >
                  {deliveryModeLabels[mode]}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-1.5">
              <Label htmlFor="timeline">Expected start</Label>
              <Select value={timeline} onValueChange={setTimeline}>
                <SelectTrigger
                  id="timeline"
                  aria-invalid={Boolean(errors.timeline)}
                  aria-describedby={errors.timeline ? "timeline-error" : undefined}
                >
                  <SelectValue placeholder="When do you want the cohort to start?" />
                </SelectTrigger>
                <SelectContent>
                  {timelineOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError("timeline")}
            </div>
          </fieldset>

          {/* Step 4 — contact details */}
          <fieldset className="space-y-4">
            <legend className="flex w-full items-center justify-between gap-3 font-semibold">
              <span>
                <span className="mr-2 font-mono text-sm text-brand-600">04</span>
                Your details
              </span>
              {/* Mascot watches while the visitor fills in contact details */}
              <CloudWatchFace className="w-16 shrink-0" />
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="contact-name">Full name</Label>
                <Input
                  id="contact-name"
                  autoComplete="name"
                  value={contact.contactName}
                  onChange={(event) =>
                    setContact((prev) => ({ ...prev, contactName: event.target.value }))
                  }
                  aria-invalid={Boolean(errors.contactName)}
                  aria-describedby={errors.contactName ? "contactName-error" : undefined}
                />
                {fieldError("contactName")}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company-name">Company</Label>
                <Input
                  id="company-name"
                  autoComplete="organization"
                  value={contact.companyName}
                  onChange={(event) =>
                    setContact((prev) => ({ ...prev, companyName: event.target.value }))
                  }
                  aria-invalid={Boolean(errors.companyName)}
                  aria-describedby={errors.companyName ? "companyName-error" : undefined}
                />
                {fieldError("companyName")}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="work-email">Work email</Label>
                <Input
                  id="work-email"
                  type="email"
                  autoComplete="email"
                  value={contact.workEmail}
                  onChange={(event) =>
                    setContact((prev) => ({ ...prev, workEmail: event.target.value }))
                  }
                  aria-invalid={Boolean(errors.workEmail)}
                  aria-describedby={errors.workEmail ? "workEmail-error" : undefined}
                />
                {fieldError("workEmail")}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="work-phone">Phone / WhatsApp</Label>
                <Input
                  id="work-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  value={contact.phone}
                  onChange={(event) => setContact((prev) => ({ ...prev, phone: event.target.value }))}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
                {fieldError("phone")}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brief-notes">Anything else? (optional)</Label>
              <Textarea
                id="brief-notes"
                placeholder="Current ERP landscape, target outcomes, preferred schedule…"
                rows={3}
                value={contact.notes}
                onChange={(event) => setContact((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>
          </fieldset>

          {errors.form && (
            <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {errors.form}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" variant="brand" size="lg" className="flex-1 gap-2" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Submit Consultation Brief
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              asChild
              className="gap-2 text-emerald-700"
            >
              <a
                href={buildEnterpriseWhatsAppUrl({
                  modules: selectedModules.map(
                    (slug) => courses.find((course) => course.slug === slug)?.shortTitle ?? slug,
                  ),
                  teamSize,
                  deliveryMode: deliveryModeLabels[deliveryMode],
                })}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="size-4" />
                Continue on WhatsApp
              </a>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function courseCategoryLabel(category: string): string {
  switch (category) {
    case "sap-functional":
      return "SAP Functional";
    case "sap-technical":
      return "SAP Technical";
    default:
      return "Full Stack";
  }
}
