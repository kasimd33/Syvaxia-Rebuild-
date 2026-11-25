import type { Metadata } from "next";

import { CareerAdvisor } from "@/components/advisor/career-advisor";
import { RoiEstimator } from "@/components/advisor/roi-estimator";

/**
 * Career Tools page — hosts the Phase 4 interactive tools:
 * the AI Career Advisor widget (Task 4.1) and the ROI & Career
 * Transition Estimator (Task 4.2).
 */

export const metadata: Metadata = {
  title: "AI Career Advisor & ROI Estimator",
  description:
    "Not sure which SAP or engineering track fits you? Get an AI-powered track recommendation and plan your transition with indicative salary bands, cohort effort, and milestone timelines.",
  alternates: { canonical: "/advisor" },
};

export default function AdvisorPage() {
  return (
    <>
      {/* Page hero */}
      <section className="bg-grid-pattern border-b bg-navy-900 text-white">
        <div className="section-padding container">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">
              Career Tools
            </p>
            <h1 className="mt-2 text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Find your track. Plan your transition.
            </h1>
            <p className="mt-4 text-pretty leading-relaxed text-navy-200">
              Two free tools to move from “interested” to “enrolled with a plan”: an AI advisor
              grounded strictly in our real course catalog, and a transition estimator built on
              representative outcomes — honest ranges, no inflated promises.
            </p>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="section-padding" aria-label="Career tools">
        <div className="container grid gap-8 lg:grid-cols-2 lg:items-start">
          <div id="ai-advisor" className="scroll-mt-24">
            <CareerAdvisor />
          </div>
          <div id="roi-estimator" className="scroll-mt-24">
            <RoiEstimator />
          </div>
        </div>
      </section>
    </>
  );
}
