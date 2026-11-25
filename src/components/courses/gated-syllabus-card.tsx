"use client";

import { CheckCircle2, Download, FileText, Loader2, MessageCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { CloudWatchFace } from "@/components/ui/cloud-watch-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Course } from "@/data/courses";
import {
  currentStatusLabels,
  joiningMonthOptions,
  type CurrentStatus,
} from "@/lib/validations";
import { getUtmParams } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { LeadApiResponse } from "@/types";

/**
 * Embedded Gated Syllabus Download card (PRD Task 3.1).
 *
 * Submits to POST /api/leads: PostgreSQL lead capture → syllabus download
 * ledger → Resend confirmation email with the PDF attached (target < 5 s)
 * → instant sales webhook. The confirmation screen offers the direct PDF
 * link and a one-click WhatsApp follow-up.
 */

const syllabusGateSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s()-]/g, ""))
    .pipe(z.string().regex(/^\+?\d{8,15}$/, "Enter a valid phone with country code")),
  city: z.string().trim().min(2, "Please enter your city").max(80, "City name is too long"),
  joiningMonth: z.string().optional(),
});

type SyllabusGateInput = z.infer<typeof syllabusGateSchema>;

interface GatedSyllabusCardProps {
  course: Course;
}

type GateState =
  | { phase: "form" }
  | { phase: "submitting" }
  | { phase: "success"; response: LeadApiResponse; submittedEmail: string }
  | { phase: "error"; message: string };

export function GatedSyllabusCard({ course }: GatedSyllabusCardProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<GateState>({ phase: "form" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState<SyllabusGateInput>({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    joiningMonth: "",
  });
  const [currentStatus, setCurrentStatus] = useState<CurrentStatus>("working-it-professional");

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setState({ phase: "form" });
      setErrors({});
    }
    setOpen(next);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = syllabusGateSchema.safeParse(values);

    if (!parsed.success) {
      setErrors(
        Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0] ?? "form", issue.message])),
      );
      return;
    }
    setErrors({});
    setState({ phase: "submitting" });

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          joiningMonth: parsed.data.joiningMonth || undefined,
          trackSlug: course.slug,
          audienceType: "learner",
          currentStatus,
          intent: "syllabus",
          pagePath: typeof window !== "undefined" ? window.location.pathname : undefined,
          ...getUtmParams(),
        }),
      });
      const data = (await response.json()) as LeadApiResponse;

      if (!response.ok || !data.ok) {
        setState({
          phase: "error",
          message:
            data.error ??
            "Something went wrong while sending the syllabus. Please try again, or ask on WhatsApp.",
        });
        return;
      }
      setState({ phase: "success", response: data, submittedEmail: parsed.data.email });
    } catch {
      setState({
        phase: "error",
        message: "Couldn't reach our server. Please try again, or ask on WhatsApp.",
      });
    }
  };

  const fieldError = (key: string) =>
    errors[key] ? (
      <p id={`gate-${key}-error`} role="alert" className="text-xs text-destructive">
        {errors[key]}
      </p>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="brand" className="w-full gap-2">
          <Download className="size-4" />
          Get Full Syllabus PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {state.phase === "success" ? (
          // ── Confirmation screen ──
          <div className="space-y-5 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="size-8 text-emerald-600" aria-hidden />
            </div>
            <div>
              <DialogTitle className="font-display text-xl">Syllabus sent!</DialogTitle>
              <DialogDescription className="mt-1.5">
                The {course.shortTitle} syllabus PDF is on its way to {state.submittedEmail} —
                usually within seconds.
              </DialogDescription>
            </div>
            {state.response.syllabusUrl && (
              <Button variant="outline" asChild className="w-full gap-2">
                <a href={state.response.syllabusUrl} target="_blank" rel="noopener noreferrer">
                  <FileText className="size-4" />
                  Open the PDF now
                </a>
              </Button>
            )}
            {state.response.whatsappUrl && (
              <Button variant="brand" asChild className="w-full gap-2">
                <a href={state.response.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" />
                  Continue on WhatsApp
                </a>
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Want cohort dates and fees? The WhatsApp thread picks up right where you left off.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              {/* Mascot rides beside the title so the dialog stays scroll-free */}
              <div className="flex items-center gap-3 text-left">
                <CloudWatchFace className="w-14 shrink-0" />
                <div className="min-w-0 space-y-1">
                  <DialogTitle className="text-left">Syllabus — {course.shortTitle}</DialogTitle>
                  <DialogDescription className="text-left">
                    {course.modules.length} modules · {course.durationWeeks} weeks · live S/4HANA access.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="gate-name">Full Name</Label>
                <Input
                  id="gate-name"
                  name="fullName"
                  autoComplete="name"
                  required
                  value={values.fullName}
                  onChange={(event) => setValues((prev) => ({ ...prev, fullName: event.target.value }))}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? "gate-fullName-error" : undefined}
                />
                {fieldError("fullName")}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gate-email">Email</Label>
                <Input
                  id="gate-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={values.email}
                  onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "gate-email-error" : undefined}
                />
                {fieldError("email")}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gate-phone">Phone / WhatsApp</Label>
                <Input
                  id="gate-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  required
                  value={values.phone}
                  onChange={(event) => setValues((prev) => ({ ...prev, phone: event.target.value }))}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "gate-phone-error" : undefined}
                />
                {fieldError("phone")}
              </div>

              {/* Single full-width column — every field stacks top-to-bottom
                  so nothing is ever cramped or side-scrolled. */}
              <div className="space-y-1.5">
                <Label htmlFor="gate-city">City</Label>
                <Input
                  id="gate-city"
                  name="city"
                  autoComplete="address-level2"
                  placeholder="Bengaluru"
                  required
                  value={values.city}
                  onChange={(event) => setValues((prev) => ({ ...prev, city: event.target.value }))}
                  aria-invalid={Boolean(errors.city)}
                  aria-describedby={errors.city ? "gate-city-error" : undefined}
                />
                {fieldError("city")}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gate-joining">Preferred joining</Label>
                <Select
                  value={values.joiningMonth}
                  onValueChange={(value) => setValues((prev) => ({ ...prev, joiningMonth: value }))}
                >
                  <SelectTrigger id="gate-joining" aria-label="Preferred joining month">
                    <SelectValue placeholder="Select (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {joiningMonthOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1.5 block">Current profile</Label>
                <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Current profile">
                  {(Object.keys(currentStatusLabels) as CurrentStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      role="radio"
                      aria-checked={currentStatus === status}
                      onClick={() => setCurrentStatus(status)}
                      className={cn(
                        "min-h-[34px] rounded-full border px-3 py-1 text-xs font-medium",
                        currentStatus === status
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-border text-muted-foreground hover:border-brand-300",
                      )}
                    >
                      {currentStatusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>

              {state.phase === "error" && (
                <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {state.message}
                </p>
              )}

              <DialogFooter className="flex-col gap-1.5">
                <Button type="submit" variant="brand" className="w-full gap-2" disabled={state.phase === "submitting"}>
                  {state.phase === "submitting" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Download className="size-4" />
                      Send Me the Syllabus
                    </>
                  )}
                </Button>
                <p className="flex items-start gap-1.5 text-left text-[11px] text-muted-foreground">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-600" aria-hidden />
                  We use your details only to send the syllabus. No spam, no resale.
                </p>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
