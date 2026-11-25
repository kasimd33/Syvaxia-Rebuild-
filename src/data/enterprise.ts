import type { DeliveryMode } from "@/data/courses";

/**
 * Enterprise L&D dataset — drives /enterprise copy and the Corporate
 * Cohort Builder's select options.
 */

export interface EnterpriseBenefit {
  title: string;
  description: string;
}

export interface TimelineOption {
  value: string;
  label: string;
}

export const enterpriseBenefits: EnterpriseBenefit[] = [
  {
    title: "Cohorts Scoped to Your Stack",
    description:
      "Choose the exact modules your teams need — SAP FICO for the finance transformation, EWM for the new DC, full-stack for the product pod. No bundled filler content.",
  },
  {
    title: "Live Systems, Not Videos",
    description:
      "Every participant works on a live S/4HANA sandbox or cloud development environment with scenario labs mapped to your business processes.",
  },
  {
    title: "Progress Reporting for L&D",
    description:
      "Attendance, lab completion, assessment scores, and capstone outcomes reported to your L&D team at agreed checkpoints — data you can act on.",
  },
  {
    title: "Hiring-Pipeline Partnership",
    description:
      "For hiring teams: access a vetted pipeline of cohort graduates with reviewed capstone portfolios and recorded project defences before you interview.",
  },
  {
    title: "Flexible Delivery Modes",
    description:
      "Live virtual for distributed teams, onsite in Bengaluru for intensive cohorts, or hybrid — scheduled around your release cycles, not against them.",
  },
  {
    title: "Assessment-Backed Outcomes",
    description:
      "Skill assessments at module boundaries and a capstone defence give you evidence of capability, not attendance certificates.",
  },
];

export const timelineOptions: TimelineOption[] = [
  { value: "immediate", label: "Immediate (within 30 days)" },
  { value: "quarter", label: "This quarter (1–3 months)" },
  { value: "half-year", label: "Next 3–6 months" },
  { value: "planning", label: "Planning / exploring options" },
];

export const teamSizeBands = [
  { min: 5, max: 15, label: "5–15" },
  { min: 16, max: 30, label: "16–30" },
  { min: 31, max: 50, label: "31–50" },
  { min: 51, max: 100, label: "51–100" },
] as const;

export const defaultDeliveryModes: DeliveryMode[] = ["live-virtual", "onsite-bengaluru", "hybrid"];

/** Case-style engagement patterns for the /enterprise proof strip. */
export const engagementPatterns = [
  {
    id: "finance-transformation",
    title: "Finance Transformation Upskilling",
    summary:
      "S/4HANA FICO cohorts for finance teams migrating from legacy ERP — Universal Journal, new asset accounting, and Fiori analytics, run on the client's process scenarios.",
    modules: ["sap-fico"],
  },
  {
    id: "dc-migration",
    title: "Distribution Centre Migration Enablement",
    summary:
      "Embedded EWM training for warehouse operations teams ahead of a DC go-live — inbound/outbound flows, RF execution, and cutover rehearsal on live systems.",
    modules: ["sap-ewm", "sap-mm"],
  },
  {
    title: "Product Team Modernisation",
    id: "platform-modernisation",
    summary:
      "Full-stack cohorts (Java 17, Spring Boot, React, Docker, CI/CD) for engineering teams modernising legacy services — deployed capstones on the client's target stack.",
    modules: ["full-stack-java"],
  },
];
