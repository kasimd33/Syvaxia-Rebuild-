import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Signal } from "lucide-react";

import { SyllabusPreviewDrawer } from "@/components/courses/syllabus-preview-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Course } from "@/data/courses";
import {
  courseCategoryLabels,
  experienceLevelLabels,
} from "@/lib/constants";
import { formatCohortStart, getEarliestOpenCohort } from "@/data/courses";
import { cn } from "@/lib/utils";

const cohortStatusStyles: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-800",
  filling: "bg-amber-100 text-amber-800",
  closed: "bg-muted text-muted-foreground",
};

const cohortStatusText: Record<string, string> = {
  open: "Cohort open",
  filling: "Filling fast",
  closed: "Cohort closed",
};

export function CourseCard({ course }: { course: Course }) {
  const cohort = getEarliestOpenCohort(course);

  return (
    <Card className="group flex flex-col transition-shadow hover:shadow-card-hover">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {course.code && <Badge variant="mono" className="module-code">{course.code}</Badge>}
            <Badge variant="brand">{courseCategoryLabels[course.category]}</Badge>
            <Badge variant="secondary">{experienceLevelLabels[course.level]}</Badge>
          </div>
          {cohort && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold",
                cohortStatusStyles[cohort.status],
              )}
            >
              {cohortStatusText[cohort.status]}
            </span>
          )}
        </div>
        <CardTitle className="font-display text-base leading-snug group-hover:text-brand-700">
          <Link href={`/courses/${course.slug}`} className="hover:underline">
            {course.title}
          </Link>
        </CardTitle>
        <p className="text-sm leading-relaxed text-muted-foreground">{course.tagline}</p>
      </CardHeader>

      <CardContent className="mt-auto grid gap-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <Clock className="size-4 text-brand-600" aria-hidden />
          {course.durationWeeks} weeks · {course.hoursPerWeek} hrs/week
        </span>
        <span className="flex items-center gap-2">
          <Signal className="size-4 text-brand-600" aria-hidden />
          {course.recommendedFor[0]}
        </span>
        {cohort && (
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4 text-brand-600" aria-hidden />
            Next cohort: {formatCohortStart(cohort.startDate)} · {cohort.seatsLeft} seats left
          </span>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-2 pt-0">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="w-full group-hover:border-brand-300 group-hover:text-brand-700"
        >
          <Link href={`/courses/${course.slug}`}>
            View details & cohorts
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
        <SyllabusPreviewDrawer course={course} />
      </CardFooter>
    </Card>
  );
}
