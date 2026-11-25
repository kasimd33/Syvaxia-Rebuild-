"use client";

import Link from "next/link";
import { CalendarClock, Coins, GraduationCap, Route, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  compensationDisclaimer,
  getCareerPath,
  starterProfiles,
  type StarterProfile,
} from "@/data/career-paths";
import {
  courses,
  formatCohortStart,
  getEarliestOpenCohort,
  type Course,
  type CourseModule,
} from "@/data/courses";
import { outcomeDisclosures } from "@/data/outcomes";

/**
 * Interactive ROI & Career Transition Estimator (PRD Task 4.2).
 *
 * Pure client-side arithmetic over canonical data — no API, no network.
 * It combines indicative compensation bands (career-paths.ts), the cohort
 * duration/effort (courses.ts), and the representative transition
 * timelines (outcomes.ts) into a milestone-by-milestone view of what a
 * transition on a given track typically looks like.
 *
 * Credibility rule: every number is rendered as a labelled range with the
 * disclaimer attached. This is a planning aid, not a promise.
 */

interface Milestone {
  label: string;
  title: string;
  description: string;
}

const NO_EXPERIENCE = 0;

/** Group modules into three phases by cumulative week boundaries. */
function buildMilestones(course: Course, interviewWindowMonths: [number, number]): Milestone[] {
  const totalWeeks = course.durationWeeks;
  const boundary1 = Math.ceil(totalWeeks / 3);
  const boundary2 = Math.ceil((2 * totalWeeks) / 3);

  const phaseModules = (from: number, to: number): CourseModule[] => {
    let weekCursor = 0;
    return course.modules.filter((module) => {
      const start = weekCursor + 1;
      const end = weekCursor + module.weeks;
      weekCursor = end;
      return start <= to && end >= from;
    });
  };

  const phase1 = phaseModules(1, boundary1);
  const capstoneWeeks = Math.max(...course.modules.slice(-2).map((m) => m.weeks));

  return [
    {
      label: `Weeks 1–${boundary1}`,
      title: "Foundations on the live system",
      description:
        phase1.length > 0
          ? `${phase1.map((m) => m.title).join(", ")} — first labs run on a live ${course.liveSystemAccess ? "system" : "environment"} from the first module.`
          : "Core concepts and first labs on the live system.",
    },
    {
      label: `Weeks ${boundary1 + 1}–${boundary2}`,
      title: "Core depth & business scenarios",
      description:
        "Delivery-style labs: real scenarios, cross-module integration, and exception handling — the decisions, not just the menu paths.",
    },
    {
      label: `Final ${capstoneWeeks} week${capstoneWeeks > 1 ? "s" : ""}`,
      title: "Capstone: " + course.capstone.title,
      description:
        "Blueprint, build, test, and present — the portfolio artefact you defend in recorded mock interviews.",
    },
    {
      label: "Cohort end",
      title: "Interview readiness",
      description:
        "Mock technical interviews with written feedback, question banks, and a trainer-reviewed resume anchored to your deliverables.",
    },
    {
      label: `+${interviewWindowMonths[0]}–${interviewWindowMonths[1]} months`,
      title: "Applications & offer window",
      description: `Typical window from cohort completion to offer in the representative snapshots — never guaranteed, and shorter for candidates with prior domain or IT experience.`,
    },
  ];
}

function formatLpa(value: number): string {
  return Number.isInteger(value) ? `₹${value}L` : `₹${value.toFixed(1)}L`;
}

export function RoiEstimator() {
  const [trackSlug, setTrackSlug] = useState<string>(courses[0]?.slug ?? "sap-abap");
  const [profile, setProfile] = useState<StarterProfile>("student");
  const [currentCtc, setCurrentCtc] = useState<number>(NO_EXPERIENCE);

  const course = useMemo(() => {
    const matched = courses.find((candidate) => candidate.slug === trackSlug);
    if (matched) return matched;
    const fallback = courses[0];
    if (!fallback) throw new Error("Course catalog is empty");
    return fallback;
  }, [trackSlug]);
  const path = getCareerPath(trackSlug);
  const band = path?.profileBands[profile] ?? null;
  const interviewWindow = path?.interviewWindowMonths ?? [2, 4];

  const milestones = useMemo(
    () => buildMilestones(course, interviewWindow),
    [course, interviewWindow],
  );

  const totalHours = course.durationWeeks * course.hoursPerWeek;
  const earliestCohort = getEarliestOpenCohort(course);
  const profileLabel = starterProfiles.find((p) => p.value === profile)?.label;

  return (
    <Card className="overflow-hidden border-border">
      <CardHeader className="border-b bg-secondary/50">
        <CardTitle className="flex items-center gap-2 font-display text-xl">
          <TrendingUp className="size-5 text-brand-600" aria-hidden />
          ROI & Career Transition Estimator
        </CardTitle>
        <CardDescription>
          Plan your transition: indicative compensation bands, cohort effort, and the
          milestone-by-milestone path — all computed locally, nothing is submitted.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8 p-6">
        {/* ── Controls ── */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="roi-track">Track</Label>
            <Select value={trackSlug} onValueChange={setTrackSlug}>
              <SelectTrigger id="roi-track">
                <SelectValue placeholder="Choose a track" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((option) => (
                  <SelectItem key={option.slug} value={option.slug}>
                    {option.shortTitle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="roi-profile">Starting profile</Label>
            <Select value={profile} onValueChange={(value) => setProfile(value as StarterProfile)}>
              <SelectTrigger id="roi-profile">
                <SelectValue placeholder="Your starting point" />
              </SelectTrigger>
              <SelectContent>
                {starterProfiles.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="roi-ctc">
              Current annual CTC{" "}
              <span className="text-xs text-muted-foreground">
                (optional —{" "}
                {currentCtc === NO_EXPERIENCE ? "not set" : `${formatLpa(currentCtc)}/yr`})
              </span>
            </Label>
            <Slider
              id="roi-ctc"
              value={[currentCtc]}
              onValueChange={(values: number[]) => setCurrentCtc(values[0] ?? NO_EXPERIENCE)}
              min={0}
              max={40}
              step={0.5}
              aria-label="Current annual CTC in lakh per year"
            />
            <p className="text-xs text-muted-foreground">
              Slide to 0 if you're a fresher or prefer not to say.
            </p>
          </div>
        </div>

        {/* ── Unrealistic-fit advisory (e.g. EWM × fresher) ── */}
        {!band && (
          <div className="rounded-lg border border-amber-300/60 bg-amber-50 p-4 text-sm dark:border-amber-500/30 dark:bg-amber-900/20">
            <p className="font-semibold text-amber-900 dark:text-amber-200">
              {course.shortTitle} is an advanced track — not a realistic direct entry from “
              {profileLabel}”.
            </p>
            <p className="mt-1.5 leading-relaxed text-amber-800 dark:text-amber-200/80">
              Honest advice from our own admissions process: start with the SAP MM cohort, get
              placed, then add EWM 6–12 months later as an upskill. That two-step path is how most
              of our EWM consultants actually got there.
            </p>
            <Button variant="outline" size="sm" asChild className="mt-3">
              <Link href="/courses/sap-mm">Explore the SAP MM track</Link>
            </Button>
          </div>
        )}

        {/* ── Results ── */}
        {band && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Compensation band */}
              <div className="rounded-lg border p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Coins className="size-3.5" aria-hidden />
                  Indicative band
                </p>
                <p className="mt-2 font-display text-2xl font-bold text-brand-700 dark:text-brand-300">
                  {formatLpa(band.band[0])} – {formatLpa(band.band[1])}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">/ year</span>
                </p>
                <p className="mt-1 text-sm font-medium">{band.roleLabel}</p>
                {band.note && (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{band.note}</p>
                )}
                {currentCtc > NO_EXPERIENCE && (
                  <p className="mt-2 border-t pt-2 text-xs text-muted-foreground">
                    vs your current {formatLpa(currentCtc)}/yr — a move within or above this band
                    typically follows your first SAP project cycle, not day one.
                  </p>
                )}
              </div>

              {/* Effort */}
              <div className="rounded-lg border p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <GraduationCap className="size-3.5" aria-hidden />
                  Cohort investment
                </p>
                <p className="mt-2 font-display text-2xl font-bold">
                  {totalHours}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">hours</span>
                </p>
                <p className="mt-1 text-sm">
                  {course.durationWeeks} weeks · {course.hoursPerWeek} h/week · live system access
                </p>
                {earliestCohort && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Next cohort: {formatCohortStart(earliestCohort.startDate)} ·{" "}
                    {earliestCohort.seatsLeft} of {earliestCohort.seatsTotal} seats left
                  </p>
                )}
              </div>

              {/* Timeline */}
              <div className="rounded-lg border p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <CalendarClock className="size-3.5" aria-hidden />
                  Transition horizon
                </p>
                <p className="mt-2 font-display text-2xl font-bold">
                  {course.durationWeeks / 4 + interviewWindow[0]}–
                  {Math.round(course.durationWeeks / 4 + interviewWindow[1])}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">months</span>
                </p>
                <p className="mt-1 text-sm">
                  {course.durationWeeks / 4} months cohort + {interviewWindow[0]}–
                  {interviewWindow[1]} months typical offer window
                </p>
              </div>
            </div>

            {/* Milestones */}
            <div>
              <p className="flex items-center gap-1.5 font-semibold">
                <Route className="size-4 text-brand-600" aria-hidden />
                Your transition milestones on {course.shortTitle}
              </p>
              <ol className="mt-4 space-y-0">
                {milestones.map((milestone, index) => (
                  <li key={milestone.label} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Timeline spine */}
                    {index < milestones.length - 1 && (
                      <span
                        aria-hidden
                        className="absolute left-[11px] top-7 h-full w-px bg-border"
                      />
                    )}
                    <span className="z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-brand-300 bg-brand-50 font-mono text-[10px] font-bold text-brand-700 dark:border-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-mono text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
                        {milestone.label}
                      </p>
                      <p className="mt-0.5 font-medium">{milestone.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                        {milestone.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}

        {/* ── Disclaimers ── */}
        <div className="space-y-1.5 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
          <p>{compensationDisclaimer}</p>
          <p>{outcomeDisclosures.guaranteeNote}</p>
        </div>
      </CardContent>
    </Card>
  );
}
