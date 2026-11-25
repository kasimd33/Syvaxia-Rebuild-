"use client";

import { BookOpen, FlaskConical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Course } from "@/data/courses";

interface SyllabusPreviewDrawerProps {
  course: Course;
  /** Render trigger as full-width button inside course cards. */
  variant?: "ghost" | "outline";
}

/**
 * Quick Syllabus Preview — module-by-module topics in a slide-over drawer,
 * letting visitors inspect the curriculum on the page before requesting
 * the full gated PDF.
 */
export function SyllabusPreviewDrawer({ course, variant = "ghost" }: SyllabusPreviewDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={variant} size="sm" className="w-full gap-1.5">
          <BookOpen className="size-4" />
          Quick syllabus preview
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg md:w-[36rem]">
        <SheetHeader className="pr-8">
          {course.code && <Badge variant="mono" className="module-code w-fit">{course.code}</Badge>}
          <SheetTitle className="font-display text-xl leading-snug">{course.title}</SheetTitle>
          <SheetDescription className="text-sm leading-relaxed">
            {course.modules.length} modules · {course.durationWeeks} weeks ·{" "}
            {course.hoursPerWeek} hrs/week. The full PDF syllabus ({" "}
            <span className="font-mono text-xs">{course.syllabusFile}</span> ) is delivered by email
            after the short lead form.
          </SheetDescription>
        </SheetHeader>

        <ol className="mt-4 space-y-4 pb-8">
          {course.modules.map((module, index) => (
            <li key={module.code} className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <span className="module-code rounded bg-navy-900 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {module.code}
                  </span>
                  {module.title}
                </h3>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {module.weeks} {module.weeks === 1 ? "week" : "weeks"}
                </span>
              </div>
              <ul className="mt-3 space-y-1">
                {module.topics.map((topic) => (
                  <li key={topic} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden />
                    {topic}
                  </li>
                ))}
              </ul>
              {module.lab && (
                <p className="mt-3 flex items-start gap-2 rounded-md bg-emerald-50 p-2.5 text-xs text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200">
                  <FlaskConical className="mt-0.5 size-3.5 shrink-0 text-emerald-600" aria-hidden />
                  <span>
                    <strong className="font-semibold">Lab:</strong> {module.lab}
                  </span>
                </p>
              )}
              <p className="sr-only">Module {index + 1} of {course.modules.length}</p>
            </li>
          ))}
        </ol>
      </SheetContent>
    </Sheet>
  );
}
