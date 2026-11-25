"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Clock, Signal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Course, CourseCategory } from "@/data/courses";
import {
  courseCategoryDescriptions,
  courseCategoryLabels,
} from "@/lib/constants";
import { courses as allCourses, formatCohortStart, getEarliestOpenCohort } from "@/data/courses";
import { cn } from "@/lib/utils";

type Filter = CourseCategory | "all";

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All Tracks" },
  { value: "sap-functional", label: "SAP Functional" },
  { value: "sap-technical", label: "SAP Technical" },
  { value: "full-stack-cloud", label: "Full Stack & Cloud" },
];

const cohortStatusStyles: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-800",
  filling: "bg-amber-100 text-amber-800",
  closed: "bg-muted text-muted-foreground",
};

export function FeaturedTracks({ courses }: { courses?: Course[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    const source = courses ?? allCourses;
    return filter === "all" ? source : source.filter((course) => course.category === filter);
  }, [filter, courses]);

  return (
    <section className="section-padding bg-background" aria-labelledby="tracks-heading">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="brand" className="mb-3">Featured Tracks</Badge>
          <h2 id="tracks-heading" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Pick your track. Train on the real system.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Every cohort is trainer-led, capped in size, and built around live environments and a
            defended capstone.
          </p>
        </div>

        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as Filter)}
          className="mt-8 flex flex-col items-center gap-6"
        >
          <TabsList aria-label="Filter tracks by category" className="h-auto flex-wrap justify-center gap-1 bg-muted/70 p-1.5">
            {filters.map((item) => (
              <TabsTrigger key={item.value} value={item.value} className="px-3">
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {filter !== "all" && (
            <p className="-mt-3 text-sm text-muted-foreground">
              {courseCategoryDescriptions[filter]}
            </p>
          )}

          <div className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((course) => {
              const cohort = getEarliestOpenCohort(course);
              return (
                <Card
                  key={course.slug}
                  className="group flex flex-col transition-shadow hover:shadow-card-hover"
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      {course.code ? (
                        <Badge variant="mono" className="module-code">{course.code}</Badge>
                      ) : (
                        <Badge variant="brand">{courseCategoryLabels[course.category]}</Badge>
                      )}
                      {cohort && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-semibold",
                            cohortStatusStyles[cohort.status],
                          )}
                        >
                          {cohort.status === "filling" ? "Filling fast" : cohort.status === "open" ? "Cohort open" : "Cohort closed"}
                        </span>
                      )}
                    </div>
                    <CardTitle className="font-display text-base leading-snug group-hover:text-brand-700">
                      {course.title}
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

                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" asChild className="w-full group-hover:border-brand-300 group-hover:text-brand-700">
                      <Link href={`/courses/${course.slug}`}>
                        View syllabus & cohorts
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </Tabs>

        <div className="mt-10 text-center">
          <Button variant="ghost" asChild className="text-brand-700">
            <Link href="/courses">
              Open the full course explorer
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
