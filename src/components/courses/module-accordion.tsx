"use client";

import { FlaskConical } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { CourseModule } from "@/data/courses";

/**
 * Curriculum timeline — module-by-module breakdown with topics and
 * the hands-on lab performed on the live system.
 */
export function ModuleAccordion({ modules }: { modules: CourseModule[] }) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="m01"
      className="w-full rounded-lg border bg-card px-5"
    >
      {modules.map((module) => (
        <AccordionItem key={module.code} value={module.code.toLowerCase()}>
          <AccordionTrigger className="gap-3 py-5 hover:no-underline">
            <span className="flex items-center gap-3 text-left">
              <span className="module-code rounded bg-navy-900 px-2 py-1 text-[11px] font-bold text-white">
                {module.code}
              </span>
              <span className="flex-1 font-semibold">{module.title}</span>
            </span>
            <span className="mr-2 shrink-0 text-xs font-normal text-muted-foreground">
              {module.weeks} {module.weeks === 1 ? "week" : "weeks"}
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <ul className="space-y-1.5">
              {module.topics.map((topic) => (
                <li key={topic} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden />
                  {topic}
                </li>
              ))}
            </ul>
            <p className="flex items-start gap-2 rounded-md bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200">
              <FlaskConical className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
              <span>
                <strong className="font-semibold">Live-system lab:</strong> {module.lab}
              </span>
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
