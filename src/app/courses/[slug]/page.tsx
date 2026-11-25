import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  ChevronRight,
  Clock,
  GraduationCap,
  Languages,
  MessageCircle,
  MonitorSmartphone,
  Target,
  TerminalSquare,
  Trophy,
} from "lucide-react";

import { CohortScheduleCard } from "@/components/courses/cohort-schedule-card";
import { GatedSyllabusCard } from "@/components/courses/gated-syllabus-card";
import { ModuleAccordion } from "@/components/courses/module-accordion";
import { SyllabusPreviewDrawer } from "@/components/courses/syllabus-preview-drawer";
import { TrainerCard } from "@/components/courses/trainer-card";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  courses,
  formatCohortStart,
  getCourseBySlug,
  getEarliestOpenCohort,
  courseSlugs,
} from "@/data/courses";
import {
  courseCategoryLabels,
  deliveryModeLabels,
  experienceLevelLabels,
  siteConfig,
} from "@/lib/constants";
import { buildCourseWhatsAppUrl } from "@/lib/whatsapp";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

/** Pre-render every course page at build time (SSG). */
export function generateStaticParams(): { slug: string }[] {
  return courseSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course) {
    return { title: "Course not found" };
  }

  return {
    title: course.title,
    description: course.description.slice(0, 155),
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: {
      title: `${course.title} | ${siteConfig.name}`,
      description: course.tagline,
      type: "website",
    },
  };
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course) notFound();

  const whatsappUrl = buildCourseWhatsAppUrl(course);
  const nextCohort = getEarliestOpenCohort(course);

  // ── JSON-LD: Course + FAQPage (PRD Task 2.3 / 5.1) ──
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: {
      "@type": "EducationalOrganization",
      name: siteConfig.legalName,
      sameAs: siteConfig.url,
      address: {
        "@type": "PostalAddress",
        addressLocality: siteConfig.address.city,
        addressRegion: siteConfig.address.region,
        addressCountry: "IN",
      },
    },
    educationalLevel: experienceLevelLabels[course.level],
    teaches: course.modules.flatMap((module) => module.topics).slice(0, 20),
    occupationalCategory: course.roles,
    inLanguage: course.language,
    hasCourseInstance: course.cohorts.map((cohort) => ({
      "@type": "CourseInstance",
      courseMode: cohort.mode === "onsite-bengaluru" ? "Onsite" : "Online",
      startDate: cohort.startDate,
      location: cohort.mode === "onsite-bengaluru" ? `${siteConfig.address.city}, India` : undefined,
      instructor: {
        "@type": "Person",
        name: course.trainer.name,
        jobTitle: course.trainer.role,
      },
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: course.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <JsonLd data={courseSchema} />
      <JsonLd data={faqSchema} />

      {/* ── Header band ── */}
      <section className="border-b bg-navy-950 py-10 text-white md:py-14">
        <div className="container">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-navy-200">
              <li>
                <Link href="/" className="hover:text-white">Home</Link>
              </li>
              <li aria-hidden><ChevronRight className="size-3.5" /></li>
              <li>
                <Link href="/courses" className="hover:text-white">Courses</Link>
              </li>
              <li aria-hidden><ChevronRight className="size-3.5" /></li>
              <li aria-current="page" className="text-white">{course.shortTitle}</li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            {course.code && <Badge variant="mono" className="module-code">{course.code}</Badge>}
            <Badge variant="brand">{courseCategoryLabels[course.category]}</Badge>
            <Badge variant="secondary">{experienceLevelLabels[course.level]}</Badge>
            {nextCohort && (
              <Badge variant="success" className="module-code">
                Next cohort {formatCohortStart(nextCohort.startDate)}
              </Badge>
            )}
          </div>

          <h1 className="mt-4 max-w-3xl text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {course.title}
          </h1>
          <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-navy-200">
            {course.tagline}
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-navy-100">
            <li className="flex items-center gap-2">
              <Clock className="size-4 text-brand-300" aria-hidden />
              {course.durationWeeks} weeks · {course.hoursPerWeek} hrs/week
            </li>
            <li className="flex items-center gap-2">
              <MonitorSmartphone className="size-4 text-brand-300" aria-hidden />
              {course.deliveryModes.map((mode) => deliveryModeLabels[mode]).join(" · ")}
            </li>
            <li className="flex items-center gap-2">
              <Languages className="size-4 text-brand-300" aria-hidden />
              {course.language}
            </li>
            <li className="flex items-center gap-2">
              <TerminalSquare className="size-4 text-emerald-400" aria-hidden />
              Live system access
            </li>
          </ul>
        </div>
      </section>

      {/* ── Body: content + sticky sidebar ── */}
      <div className="container grid gap-10 py-12 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="min-w-0 space-y-12">
          {/* Who it's for */}
          <section aria-labelledby="fit-heading" className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-5 shadow-card">
              <h2 id="fit-heading" className="flex items-center gap-2 font-display text-base font-semibold">
                <GraduationCap className="size-5 text-brand-600" aria-hidden />
                Recommended for
              </h2>
              <ul className="mt-3 space-y-2">
                {course.recommendedFor.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <BadgeCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border bg-card p-5 shadow-card">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold">
                <Target className="size-5 text-brand-600" aria-hidden />
                Prerequisites
              </h2>
              <ul className="mt-3 space-y-2">
                {course.prerequisites.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Tools & roles */}
          <section aria-labelledby="tools-roles-heading">
            <h2 id="tools-roles-heading" className="font-display text-xl font-semibold tracking-tight">
              Tools & target roles
            </h2>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {course.tools.map((tool) => (
                <Badge key={tool} variant="secondary" className="font-mono text-xs font-normal">
                  {tool}
                </Badge>
              ))}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {course.roles.map((role) => (
                <p key={role} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Trophy className="size-4 shrink-0 text-amber-500" aria-hidden />
                  {role}
                </p>
              ))}
            </div>
          </section>

          {/* Curriculum */}
          <section aria-labelledby="curriculum-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="curriculum-heading" className="font-display text-xl font-semibold tracking-tight">
                  Module-by-module curriculum
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {course.modules.length} modules · every module ends with a live-system lab.
                </p>
              </div>
              <div className="w-full sm:w-56">
                <SyllabusPreviewDrawer course={course} variant="outline" />
              </div>
            </div>
            <div className="mt-5">
              <ModuleAccordion modules={course.modules} />
            </div>
          </section>

          {/* Capstone */}
          <section
            aria-labelledby="capstone-heading"
            className="rounded-lg border border-brand-200 bg-brand-50 p-6 dark:border-brand-800 dark:bg-brand-900/30"
          >
            <h2 id="capstone-heading" className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-brand-900 dark:text-brand-100">
              <Trophy className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
              Capstone project
            </h2>
            <p className="mt-1 font-mono text-sm font-medium text-brand-700 dark:text-brand-300">
              {course.capstone.title}
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-brand-900/90 dark:text-brand-100/90">
              {course.capstone.description}
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {course.capstone.deliverables.map((deliverable) => (
                <li
                  key={deliverable}
                  className="flex items-start gap-2 rounded-md bg-white/70 p-2.5 text-sm dark:bg-white/10"
                >
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
                  <span className="text-muted-foreground">{deliverable}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Trainer */}
          <section aria-labelledby="trainer-heading">
            <h2 id="trainer-heading" className="mb-4 font-display text-xl font-semibold tracking-tight">
              Learn from a delivery practitioner
            </h2>
            <TrainerCard trainer={course.trainer} />
          </section>

          {/* Course FAQs */}
          <section aria-labelledby="course-faq-heading">
            <h2 id="course-faq-heading" className="mb-4 font-display text-xl font-semibold tracking-tight">
              Frequently asked questions
            </h2>
            <Accordion type="single" collapsible className="w-full rounded-lg border bg-card px-5">
              {course.faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`cf-${index}`}>
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>

        {/* ── Sidebar ── */}
        <aside className="space-y-5 lg:sticky lg:top-20">
          <div className="rounded-lg border bg-card p-5 shadow-card">
            <h2 className="font-display text-base font-semibold">Ready to start?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {nextCohort
                ? `Next cohort starts ${formatCohortStart(nextCohort.startDate)} — ${nextCohort.seatsLeft} seats left.`
                : "Join the waitlist for the next scheduled cohort."}
            </p>
            <div className="mt-4 space-y-2">
              <GatedSyllabusCard course={course} />
              <Button variant="outline" className="w-full gap-2 text-emerald-700" asChild>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" />
                  Ask about this track
                </a>
              </Button>
            </div>
          </div>

          <CohortScheduleCard cohorts={course.cohorts} />
          <TrainerCard trainer={course.trainer} />
        </aside>
      </div>
    </>
  );
}
