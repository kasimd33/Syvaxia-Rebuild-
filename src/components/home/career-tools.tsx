import Link from "next/link";
import { ArrowRight, Bot, TrendingUp } from "lucide-react";

import { SectionHeading } from "@/components/home/section-heading";
import { courses } from "@/data/courses";

/**
 * Home-page band for the Phase 4 career tools — links into the /advisor
 * page where both interactive tools are hosted.
 */

const toolCards = [
  {
    href: "/advisor#ai-advisor",
    icon: Bot,
    title: "AI Career Advisor",
    description: `Answer three quick questions and get an honest track recommendation — grounded strictly in our ${courses.length} real cohorts, not marketing copy.`,
    cta: "Get your recommendation",
  },
  {
    href: "/advisor#roi-estimator",
    icon: TrendingUp,
    title: "ROI & Transition Estimator",
    description:
      "Indicative salary bands, cohort effort in hours, and a milestone-by-milestone transition timeline — computed live, nothing submitted.",
    cta: "Estimate your transition",
  },
] as const;

export function CareerTools() {
  return (
    <section className="section-padding" aria-labelledby="career-tools-heading">
      <div className="container">
        <SectionHeading
          id="career-tools-heading"
          eyebrow="Free career tools"
          title="Not sure which track fits you?"
          description="Use the same tools our counsellors start with — then validate the plan with a human before you commit."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {toolCards.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-lg border bg-card p-6 transition-all hover:border-brand-300 hover:shadow-md"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-900/40 dark:text-brand-400">
                <tool.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{tool.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {tool.description}
              </p>
              <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
                {tool.cta}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
