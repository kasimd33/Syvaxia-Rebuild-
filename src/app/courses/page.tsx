import type { Metadata } from "next";

import { CourseExplorer } from "@/components/courses/course-explorer";
import { courses } from "@/data/courses";

export const metadata: Metadata = {
  title: "Course Explorer — SAP & Full-Stack Cohort Tracks",
  description:
    "Browse Syvaxia's SAP ABAP, FICO, MM, EWM and Full-Stack Java cohort tracks. Search by domain, experience level and delivery mode — inspect module-by-module syllabus previews on the page.",
  alternates: { canonical: "/courses" },
};

export default function CoursesPage() {
  return (
    <>
      <section className="border-b bg-navy-950 py-14 text-white">
        <div className="container">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">
            Course & Track Explorer
          </p>
          <h1 className="mt-2 max-w-2xl text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Find the cohort that fits your background and goal
          </h1>
          <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-navy-200">
            Every track is trainer-led, capped at 20–30 seats, and built on live systems. Preview
            the syllabus module-by-module right here — no form needed.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <CourseExplorer catalog={courses} />
        </div>
      </section>
    </>
  );
}
