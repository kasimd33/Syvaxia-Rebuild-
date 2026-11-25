"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CalendarCheck, CheckCircle2, ChevronRight, FileText, MessageCircle, PhoneCall, Presentation } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { courses } from "@/data/courses";
import { siteConfig } from "@/lib/constants";
import { getUtmParams } from "@/lib/utils";
import {
  currentStatusLabels,
  joiningMonthOptions,
  type CurrentStatus,
  type LeadIntent,
} from "@/lib/validations";
import type { LeadApiResponse } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Smart Multi-Step Lead Modal (PRD Task 3.2).
 *
 * Step 1: intent + track of interest
 * Step 2: current profile + contact details
 * Step 3: confirmation with syllabus download link + one-click WhatsApp
 *
 * The form posts to POST /api/leads, which persists to PostgreSQL, emails
 * the lead via Resend (PDF attached for syllabus intent), and fires the
 * instant sales webhook.
 */

interface LeadModalOptions {
  intent?: LeadIntent;
  trackSlug?: string;
}

interface LeadModalContextValue {
  openLeadModal: (options?: LeadModalOptions) => void;
}

const LeadModalContext = createContext<LeadModalContextValue | null>(null);

export function useLeadModal(): LeadModalContextValue {
  const context = useContext(LeadModalContext);
  if (!context) throw new Error("useLeadModal must be used within LeadModalProvider");
  return context;
}

const intentOptions: { value: LeadIntent; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: "demo",
    label: "Book a Free Demo",
    description: "Sit in on a live cohort session",
    icon: <Presentation className="size-5" />,
  },
  {
    value: "syllabus",
    label: "Download Syllabus",
    description: "Full PDF in your inbox in seconds",
    icon: <FileText className="size-5" />,
  },
  {
    value: "callback",
    label: "Request a Callback",
    description: "Talk to a counsellor first",
    icon: <PhoneCall className="size-5" />,
  },
];

export function LeadModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<LeadModalOptions>({});

  const openLeadModal = useCallback((next?: LeadModalOptions) => {
    setOptions(next ?? {});
    setOpen(true);
  }, []);

  const contextValue = useMemo(() => ({ openLeadModal }), [openLeadModal]);

  return (
    <LeadModalContext.Provider value={contextValue}>
      {children}
      <LeadModal open={open} onOpenChange={setOpen} defaults={options} />
    </LeadModalContext.Provider>
  );
}

// ─── The modal itself ───────────────────────────────────────────────────────

function LeadModal({
  open,
  onOpenChange,
  defaults,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaults: LeadModalOptions;
}) {
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState<LeadIntent>("demo");
  const [trackSlug, setTrackSlug] = useState<string>("");
  const [currentStatus, setCurrentStatus] = useState<CurrentStatus>("student-fresh-graduate");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [joiningMonth, setJoiningMonth] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<LeadApiResponse | null>(null);

  // Reset per open, applying any preset context (e.g. from a course CTA).
  const handleOpenChange = (next: boolean) => {
    if (next) {
      setStep(defaults.intent && defaults.trackSlug ? 2 : 1);
      setIntent(defaults.intent ?? "demo");
      setTrackSlug(defaults.trackSlug ?? "");
      setResult(null);
      setErrors({});
    }
    onOpenChange(next);
  };

  const validateStep1 = (): boolean => {
    if (!intent) {
      setErrors({ intent: "Choose what you'd like to do" });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateContact = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (fullName.trim().length < 2) nextErrors.fullName = "Please enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = "Enter a valid email address";
    if (!/^\+?\d{8,15}$/.test(phone.replace(/[\s()-]/g, ""))) {
      nextErrors.phone = "Enter a valid phone with country code";
    }
    if (city.trim().length < 2) nextErrors.city = "Please enter your city";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateContact() || submitting) return;
    setSubmitting(true);
    setErrors({});

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone,
          city: city.trim(),
          joiningMonth,
          trackSlug,
          audienceType: "learner",
          currentStatus,
          intent,
          pagePath: typeof window !== "undefined" ? window.location.pathname : undefined,
          ...getUtmParams(),
        }),
      });
      const data = (await response.json()) as LeadApiResponse;

      if (!response.ok || !data.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setErrors((prev) => ({
          ...prev,
          form: data.error ?? "Something went wrong — please try again, or message us on WhatsApp.",
        }));
        return;
      }
      setResult(data);
      setStep(3);
    } catch {
      setErrors({
        form: "Couldn't reach our server. Please try again, or message us on WhatsApp.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTrack = courses.find((course) => course.slug === trackSlug);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {/* Confirmation (step 3) */}
        {step === 3 && result?.ok ? (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="size-8 text-emerald-600" aria-hidden />
            </div>
            <div>
              <DialogTitle className="font-display text-xl">You&apos;re all set!</DialogTitle>
              <DialogDescription className="mt-1.5">
                {intent === "syllabus"
                  ? `The ${selectedTrack?.shortTitle ?? "course"} syllabus PDF is on its way to ${email}.`
                  : `A Syvaxia counsellor will contact you within one business day${selectedTrack ? ` about ${selectedTrack.shortTitle}` : ""}.`}
              </DialogDescription>
            </div>

            {result.syllabusUrl && (
              <Button variant="outline" asChild className="w-full gap-2">
                <a href={result.syllabusUrl} target="_blank" rel="noopener noreferrer">
                  <FileText className="size-4" />
                  Open the syllabus PDF now
                </a>
              </Button>
            )}

            {result.whatsappUrl && (
              <Button variant="brand" asChild className="w-full gap-2">
                <a href={result.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" />
                  Continue on WhatsApp
                </a>
              </Button>
            )}

            <p className="text-xs text-muted-foreground">
              Prefer browsing first?{" "}
              {selectedTrack ? (
                <Link href={`/courses/${selectedTrack.slug}`} className="text-brand-600 hover:underline">
                  Explore the {selectedTrack.shortTitle} track
                </Link>
              ) : (
                <Link href="/courses" className="text-brand-600 hover:underline">
                  Explore all tracks
                </Link>
              )}
            </p>
          </div>
        ) : (
          <>
            {/* Form steps 1–2 */}
            <div className="pr-6">
              <DialogTitle className="font-display text-xl">
                {step === 1 ? "How can we help?" : "Almost there"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {step === 1
                  ? "Pick your intent — we'll tailor the next steps."
                  : "Tell us who you are so the right counsellor follows up."}
              </DialogDescription>
            </div>

            {step === 1 ? (
              <div className="space-y-5">
                <div className="grid gap-2" role="radiogroup" aria-label="What would you like to do?">
                  {intentOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={intent === option.value}
                      onClick={() => setIntent(option.value)}
                      className={cn(
                        "flex min-h-[60px] items-center gap-3 rounded-lg border p-3 text-left transition-all",
                        intent === option.value
                          ? "border-brand-600 bg-brand-50 shadow-sm dark:bg-brand-900/30"
                          : "border-border bg-background hover:border-brand-300",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-md",
                          intent === option.value ? "bg-brand-600 text-white" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {option.icon}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{option.label}</span>
                        <span className="block text-xs text-muted-foreground">{option.description}</span>
                      </span>
                    </button>
                  ))}
                </div>

                <div>
                  <Label className="mb-2">Track of interest</Label>
                  <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Track of interest">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={trackSlug === ""}
                      onClick={() => setTrackSlug("")}
                      className={cn(
                        "min-h-[40px] rounded-full border px-3 py-1 text-sm font-medium",
                        trackSlug === ""
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-border text-muted-foreground hover:border-brand-300",
                      )}
                    >
                      Not sure yet
                    </button>
                    {courses.map((course) => (
                      <button
                        key={course.slug}
                        type="button"
                        role="radio"
                        aria-checked={trackSlug === course.slug}
                        onClick={() => setTrackSlug(course.slug)}
                        className={cn(
                          "min-h-[40px] rounded-full border px-3 py-1 text-sm font-medium",
                          trackSlug === course.slug
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-border text-muted-foreground hover:border-brand-300",
                        )}
                      >
                        {course.shortTitle}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="brand"
                  className="w-full gap-2"
                  onClick={() => validateStep1() && setStep(2)}
                >
                  Continue
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="mb-2">Current profile</Label>
                  <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Current profile">
                    {(Object.keys(currentStatusLabels) as CurrentStatus[]).map((status) => (
                      <button
                        key={status}
                        type="button"
                        role="radio"
                        aria-checked={currentStatus === status}
                        onClick={() => setCurrentStatus(status)}
                        className={cn(
                          "min-h-[40px] rounded-full border px-3 py-1 text-sm font-medium",
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

                <div className="space-y-1.5">
                  <Label htmlFor="lead-name">Full Name</Label>
                  <Input
                    id="lead-name"
                    autoComplete="name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    aria-invalid={Boolean(errors.fullName)}
                  />
                  {errors.fullName && (
                    <p role="alert" className="text-xs text-destructive">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lead-email">Email</Label>
                  <Input
                    id="lead-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && (
                    <p role="alert" className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lead-phone">Phone / WhatsApp</Label>
                  <Input
                    id="lead-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    aria-invalid={Boolean(errors.phone)}
                  />
                  {errors.phone && (
                    <p role="alert" className="text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="lead-city">City</Label>
                    <Input
                      id="lead-city"
                      autoComplete="address-level2"
                      placeholder="Bengaluru"
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      aria-invalid={Boolean(errors.city)}
                    />
                    {errors.city && (
                      <p role="alert" className="text-xs text-destructive">{errors.city}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="lead-joining">Preferred joining</Label>
                    <Select value={joiningMonth} onValueChange={setJoiningMonth}>
                      <SelectTrigger id="lead-joining" aria-label="Preferred joining month">
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
                </div>

                {errors.form && (
                  <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {errors.form}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-none" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button variant="brand" className="flex-1 gap-2" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Submitting…" : intent === "syllabus" ? "Send me the syllabus" : "Submit request"}
                    {!submitting && <CalendarCheck className="size-4" />}
                  </Button>
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  We use your details only to follow up about your request — no spam, no resale. By
                  submitting you agree to be contacted about {siteConfig.name} programs.
                </p>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
