import { CheckCircle2 } from "lucide-react";

import { methodologySteps } from "@/data/outcomes";
import { SectionHeading } from "@/components/home/section-heading";

/**
 * "How Cohorts Work" — the Lab & Capstone methodology breakdown.
 * Server component; static data, zero client JS.
 */
export function Methodology() {
  return (
    <section className="section-padding border-y bg-muted/40" aria-labelledby="methodology-heading">
      <div className="container">
        <SectionHeading
          id="methodology-heading"
          eyebrow="How Cohorts Work"
          title="The Lab & Capstone Methodology"
          description="Four structural commitments in every Syvaxia cohort — the same discipline delivery teams use, applied to learning."
        />

        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {methodologySteps.map((step) => (
            <li key={step.step} className="relative flex flex-col rounded-lg border bg-card p-6 shadow-card">
              <span
                className="font-mono text-4xl font-bold text-brand-600/25"
                aria-hidden
              >
                {String(step.step).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-base font-semibold leading-snug">
                {step.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
              <ul className="mt-4 space-y-1.5 border-t pt-4">
                {step.proofPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
