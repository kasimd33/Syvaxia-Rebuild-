import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FlaskConical, ShieldAlert, Target } from "lucide-react";

import { SectionHeading } from "@/components/home/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { methodologySteps, outcomeDisclosures } from "@/data/outcomes";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About — Story, Methodology & Lab Standards",
  description:
    "Why Syvaxia exists, how the lab & capstone methodology works, and the standards we hold our cohorts to. Bengaluru-based SAP and software engineering training.",
  alternates: { canonical: "/about" },
};

const labStandards = [
  {
    title: "Live production-style systems",
    description:
      "Every SAP participant works on a live S/4HANA sandbox for the full cohort. Full-stack participants deploy to real cloud infrastructure. Slides teach concepts; systems build skill.",
  },
  {
    title: "Cohorts capped at 20–30",
    description:
      "We refuse oversize batches. Trainers review every participant's labs, and capstone defences are individual — not group hand-waves.",
  },
  {
    title: "Scenario-first labs",
    description:
      "Labs are written from delivery-style scenarios: a blocked invoice that must be released, an ASN that must reach the right bin, an API that must survive a load test.",
  },
  {
    title: "Reviewed deliverables",
    description:
      "Code reviews, blueprint reviews, and recorded project defences with written feedback — the same artifacts hiring teams later inspect.",
  },
  {
    title: "Honest outcome framing",
    description:
      outcomeDisclosures.guaranteeNote,
  },
  {
    title: "Curriculum currency",
    description:
      "Syllabi are revised every cohort cycle against current S/4HANA releases and modern tooling — RAP over legacy dialogs, account-based COPA, Java 17, React 19.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b bg-navy-950 py-16 text-white md:py-20">
        <div className="container grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">
              About Syvaxia
            </p>
            <h1 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Built by practitioners who got tired of slide-deck training
            </h1>
            <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-navy-200">
              {siteConfig.legalName} started in {siteConfig.address.city} with a simple conviction:
              enterprise skills are built on real systems, real scenarios, and reviewed work — not
              recorded videos and inflated promises. We run SAP and full-engineering cohorts the way
              delivery teams actually work: live systems, scoped briefs, capstones, and defences.
            </p>
            <p className="mt-4 font-mono text-sm text-brand-300">{siteConfig.tagline}</p>
          </div>
          <div className="mx-auto w-full max-w-xs rounded-xl bg-white p-6 shadow-glow lg:max-w-sm">
            <Image
              src="/logo.png?v=3"
              alt="Syvaxia logo — Where passion meets innovation"
              width={489}
              height={138}
              className="h-auto w-full"
              priority
            />
          </div>
        </div>
      </section>

      {/* Story / philosophy */}
      <section className="section-padding" aria-labelledby="story-heading">
        <div className="container grid gap-10 lg:grid-cols-2">
          <div>
            <Badge variant="brand" className="mb-3">Our Story</Badge>
            <h2 id="story-heading" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              The training institute we wished existed when we were junior engineers
            </h2>
            <div className="mt-5 space-y-4 leading-relaxed text-muted-foreground">
              <p>
                Our founding trainers spent years leading SAP implementations and product teams —
                and kept meeting new hires who had certificates but had never released a transport,
                closed a period, or shipped through CI/CD. The gap wasn&apos;t effort; it was
                training that never touched a real system.
              </p>
              <p>
                Syvaxia&apos;s answer is structural: small cohorts, live environments, scenario
                labs in every module, and a capstone specified like a client engagement. Nothing in
                our model depends on marketing numbers — the curriculum, the system access, and the
                reviewed deliverables are the product.
              </p>
              <p>
                Today we serve two audiences from the same lab standards: individual professionals
                and graduates building enterprise careers, and corporate L&amp;D teams upskilling
                entire departments on SAP and modern engineering stacks.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-5 shadow-card">
              <h3 className="flex items-center gap-2 font-display text-base font-semibold">
                <Target className="size-5 text-brand-600" aria-hidden />
                What we optimize for
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Demonstrable capability at interview time: a portfolio of reviewed deliverables and
                the ability to defend them — not completion certificates.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-5 shadow-card">
              <h3 className="flex items-center gap-2 font-display text-base font-semibold">
                <ShieldAlert className="size-5 text-emerald-600" aria-hidden />
                What we refuse to do
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Publish placement percentages we can&apos;t audit, promise salaries, or run
                200-seat batches where nobody gets reviewed. If a competitor promises guarantees,
                ask them to put it in writing.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-5 shadow-card">
              <h3 className="flex items-center gap-2 font-display text-base font-semibold">
                <FlaskConical className="size-5 text-brand-600" aria-hidden />
                Who teaches
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Only practitioners with 12+ years of delivery experience — consultants who still
                work programs, engineers who still ship. Meet them on any{" "}
                <Link href="/courses" className="text-brand-600 hover:underline">course page</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology recap */}
      <section className="section-padding border-y bg-muted/40" aria-labelledby="method-heading">
        <div className="container">
          <SectionHeading
            id="method-heading"
            eyebrow="Methodology"
            title="The Lab & Capstone standard"
            description="The same four commitments run through every individual cohort and corporate program."
          />
          <ol className="mt-12 grid gap-6 md:grid-cols-2">
            {methodologySteps.map((step) => (
              <li key={step.step} className="flex gap-4 rounded-lg border bg-card p-6 shadow-card">
                <span className="font-mono text-2xl font-bold text-brand-600/40" aria-hidden>
                  {String(step.step).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                    {step.proofPoints.map((point) => (
                      <li key={point} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" aria-hidden />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Lab standards */}
      <section className="section-padding" aria-labelledby="standards-heading">
        <div className="container">
          <SectionHeading
            id="standards-heading"
            eyebrow="Lab Standards"
            title="Six standards every Syvaxia cohort is held to"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {labStandards.map((standard) => (
              <article key={standard.title} className="rounded-lg border bg-card p-6 shadow-card">
                <CheckCircle2 className="size-6 text-emerald-600" aria-hidden />
                <h3 className="mt-3 font-display text-base font-semibold">{standard.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {standard.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-navy-900 text-white">
        <div className="container flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-2xl text-balance font-display text-2xl font-bold tracking-tight sm:text-3xl">
            See the standard for yourself
          </h2>
          <p className="max-w-xl text-pretty leading-relaxed text-navy-200">
            Sit in on a live demo session, preview any syllabus module-by-module, or bring your
            team through a scoped corporate cohort.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="brand" asChild className="h-12 px-7">
              <Link href="/courses">
                Explore the tracks
                <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 border-white/25 bg-transparent px-7 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/enterprise">Corporate training</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
