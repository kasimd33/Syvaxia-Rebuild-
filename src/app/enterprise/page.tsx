import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Briefcase, CheckCircle2, GraduationCap, Handshake } from "lucide-react";

import { CohortBuilder } from "@/components/enterprise/cohort-builder";
import { SectionHeading } from "@/components/home/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { engagementPatterns, enterpriseBenefits } from "@/data/enterprise";
import { courses } from "@/data/courses";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Enterprise L&D & Hiring Solutions — Corporate SAP Training",
  description:
    "Scoped corporate cohorts for L&D and hiring teams: SAP & full-stack training for 5–100+ participants, delivered live virtual, onsite Bengaluru, or hybrid — with assessments and progress reporting.",
  alternates: { canonical: "/enterprise" },
};

export default function EnterprisePage() {
  const moduleNames = courses.map((course) => course.shortTitle).join(" · ");

  return (
    <>
      {/* Hero */}
      <section className="border-b bg-navy-950 py-16 text-white md:py-20">
        <div className="container max-w-3xl text-center">
          <Badge variant="brand" className="mb-4">Enterprise & Hiring Teams</Badge>
          <h1 className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Workforce upskilling that produces evidence, not attendance sheets
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty leading-relaxed text-navy-200">
            Scoped corporate cohorts on live systems — for finance transformations, warehouse
            go-lives, and product-team modernisation. Every participant finishes with assessed
            deliverables your L&D team can verify.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" variant="brand" asChild className="h-12 px-7">
              <Link href="#cohort-builder">
                Build Your Cohort
                <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 border-white/25 bg-transparent px-7 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="#hiring-pipeline">Hiring Pipeline Partnership</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding" aria-labelledby="benefits-heading">
        <div className="container">
          <SectionHeading
            id="benefits-heading"
            eyebrow="Why L&D Teams Choose Syvaxia"
            title="Corporate training engineered like a delivery project"
            description="No bundled content libraries. Each engagement is scoped to your modules, your systems, and your timeline."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {enterpriseBenefits.map((benefit) => (
              <Card key={benefit.title}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-start gap-2 font-display text-base leading-snug">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden />
                    {benefit.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">{benefit.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement patterns */}
      <section className="section-padding border-y bg-muted/40" aria-labelledby="patterns-heading">
        <div className="container">
          <SectionHeading
            id="patterns-heading"
            eyebrow="Engagement Patterns"
            title="Programs we run most often"
            description={`Available corporate tracks: ${moduleNames}.`}
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {engagementPatterns.map((pattern) => (
              <article key={pattern.id} className="rounded-lg border bg-card p-6 shadow-card">
                <p className="font-mono text-xs font-semibold uppercase tracking-wide text-brand-600">
                  {pattern.modules.map((slug) => slug.replace("sap-", "").replace("-java", " js")).join(" + ")}
                </p>
                <h3 className="mt-2 font-display text-base font-semibold">{pattern.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pattern.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Cohort Builder */}
      <section id="cohort-builder" className="section-padding scroll-mt-20" aria-labelledby="builder-heading">
        <div className="container">
          <SectionHeading
            id="builder-heading"
            eyebrow="Corporate Cohort Builder"
            title="Scope your program now"
            description="Select modules, drag your team size, choose delivery mode — and submit a structured consultation brief. You'll hear from our enterprise team within one business day."
          />
          <div className="mx-auto mt-12 max-w-3xl">
            <CohortBuilder />
          </div>
        </div>
      </section>

      {/* Hiring pipeline partnership */}
      <section
        id="hiring-pipeline"
        className="section-padding scroll-mt-20 border-t bg-navy-900 text-white"
        aria-labelledby="hiring-heading"
      >
        <div className="container grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-brand-300">
              <Handshake className="size-4" aria-hidden />
              For Hiring Teams
            </p>
            <h2 id="hiring-heading" className="mt-3 text-balance font-display text-2xl font-bold tracking-tight sm:text-3xl">
              A talent pipeline you can inspect before you interview
            </h2>
            <p className="mt-4 max-w-lg text-pretty leading-relaxed text-navy-200">
              Every cohort graduate leaves with reviewed capstone portfolios and recorded project
              defences. Hiring partners get structured access to that evidence — plus first look at
              participants completing tracks you name.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-navy-100">
              {[
                "Review capstone blueprints and project defences pre-interview",
                "Name the tracks you hire for — we shape cohort projects toward them",
                "Assessment scores and trainer feedback included in candidate profiles",
                "No placement fees for candidates; transparent partnership terms",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <Button variant="brand" size="lg" asChild className="mt-8 h-12 px-7">
              <Link href="#cohort-builder">
                <Briefcase className="size-5" />
                Start a Partnership Brief
              </Link>
            </Button>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="flex items-center gap-2 font-display text-lg font-semibold">
              <GraduationCap className="size-5 text-brand-300" aria-hidden />
              What a graduate&apos;s evidence pack contains
            </p>
            <ul className="mt-4 space-y-3 text-sm text-navy-100">
              {[
                "Capstone configuration blueprint / deployed application",
                "Module-wise assessment scores",
                "Recorded mock-interview project defence",
                "Trainer competency notes",
                "Verified cohort completion certificate",
              ].map((item, index) => (
                <li key={item} className="flex items-center gap-3 rounded-md bg-white/5 p-3">
                  <span className="font-mono text-xs font-bold text-brand-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-navy-300">
              Evidence packs are shared only with candidate consent. {siteConfig.legalName} does not
              charge candidates placement fees.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
