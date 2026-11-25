import Link from "next/link";
import { ArrowRight, CheckCircle2, FileCheck, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/home/section-heading";
import { outcomeDisclosures, outcomeSnapshots } from "@/data/outcomes";

/**
 * Verified Outcomes & Case Snapshots.
 * Credibility-first: structural transition details + explicit disclosures,
 * no placement rates or salary claims.
 */
export function Outcomes() {
  return (
    <section className="section-padding bg-background" aria-labelledby="outcomes-heading">
      <div className="container">
        <SectionHeading
          id="outcomes-heading"
          eyebrow="Verified Outcomes"
          title="Role transitions, backed by deliverables"
          description="Every snapshot below is tied to the artefacts the participant finished with — because portfolios convince hiring teams, not promises."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {outcomeSnapshots.slice(0, 3).map((snapshot) => (
            <article
              key={snapshot.id}
              className="flex flex-col rounded-lg border bg-card p-6 shadow-card"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary">{snapshot.trackTitle}</Badge>
                <span className="text-xs font-medium text-muted-foreground">
                  ~{snapshot.timelineMonths} months
                </span>
              </div>

              <div className="mt-4 space-y-1.5 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">From:</span> {snapshot.fromProfile}
                </p>
                <p className="flex items-start gap-1.5">
                  <ArrowRight className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                  <span>
                    <span className="font-medium">To:</span> {snapshot.toRole}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{snapshot.effortNote}</p>
              </div>

              <div className="mt-4 border-t pt-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <FileCheck className="size-3.5 text-brand-600" aria-hidden />
                  Finished with
                </p>
                <ul className="mt-2 space-y-1.5">
                  {snapshot.deliverables.map((deliverable) => (
                    <li key={deliverable} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
                      <span className="text-muted-foreground">{deliverable}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        {/* Honest disclosure block */}
        <div className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-lg border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-900/30">
          <Info className="mt-0.5 size-4 shrink-0 text-brand-600 dark:text-brand-400" aria-hidden />
          <p className="text-xs leading-relaxed text-brand-900 dark:text-brand-100">
            {outcomeDisclosures.snapshotNote} {outcomeDisclosures.guaranteeNote}
          </p>
        </div>
      </div>
    </section>
  );
}
