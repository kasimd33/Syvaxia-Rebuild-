/**
 * Verified Outcomes & Case Snapshots
 * ----------------------------------
 * Credibility rules (per brand guidelines): snapshots describe the
 * *structure* of real transitions — starting profile, chosen track,
 * timeline, and the concrete deliverables the participant finished with.
 * No salary figures, no placement percentages, no invented company names.
 *
 * `isRepresentative` marks anonymised/composite snapshots so the page
 * can disclose them honestly.
 */

export interface OutcomeSnapshot {
  id: string;
  trackSlug: string;
  trackTitle: string;
  fromProfile: string;
  toRole: string;
  timelineMonths: number;
  effortNote: string;
  deliverables: string[];
  isRepresentative: boolean;
}

export interface MethodologyStep {
  step: number;
  title: string;
  description: string;
  proofPoints: string[];
}

export const outcomeSnapshots: OutcomeSnapshot[] = [
  {
    id: "abap-support-to-dev",
    trackSlug: "sap-abap",
    trackTitle: "SAP ABAP on S/4HANA",
    fromProfile: "Application support analyst (2 yrs, non-SAP)",
    toRole: "ABAP Consultant — IT services firm, Bengaluru",
    timelineMonths: 6,
    effortNote: "Weekend cohort + ~8 hrs/week of lab practice",
    deliverables: [
      "RAP-based OData V4 extension with Fiori Elements UI",
      "BAdI enhancement with ABAP Unit tests",
      "Capstone released through full transport cycle",
    ],
    isRepresentative: true,
  },
  {
    id: "commerce-grad-to-fico",
    trackSlug: "sap-fico",
    trackTitle: "SAP FICO on S/4HANA",
    fromProfile: "B.Com graduate, accounts executive (1.5 yrs)",
    toRole: "SAP FI Analyst — manufacturing group",
    timelineMonths: 7,
    effortNote: "Weekend onsite cohort, capstone presented in hiring workshop",
    deliverables: [
      "End-to-end company code configuration blueprint",
      "Executed automatic payment run & month-end asset close",
      "Account-based COPA margin analysis model",
    ],
    isRepresentative: true,
  },
  {
    id: "ops-to-mm",
    trackSlug: "sap-mm",
    trackTitle: "SAP MM on S/4HANA",
    fromProfile: "Procurement executive (3 yrs, non-ERP)",
    toRole: "SAP MM Consultant — retail implementation project",
    timelineMonths: 5,
    effortNote: "Evening virtual cohort while working full-time",
    deliverables: [
      "Full P2P configuration with release strategy",
      "Three-way-match invoice verification flow demo",
      "Client-workshop style capstone presentation",
    ],
    isRepresentative: true,
  },
  {
    id: "qa-to-fullstack",
    trackSlug: "full-stack-java",
    trackTitle: "Full Stack Java & React",
    fromProfile: "Manual QA engineer (2.5 yrs)",
    toRole: "Backend Developer (Java/Spring) — product startup",
    timelineMonths: 8,
    effortNote: "Weekday-evening cohort, ~12 hrs/week incl. labs",
    deliverables: [
      "Deployed two-service Spring Boot application with JWT auth",
      "React/TypeScript frontend with CI/CD pipeline",
      "Two recorded mock-interview project defences",
    ],
    isRepresentative: true,
  },
  {
    id: "mm-to-ewm",
    trackSlug: "sap-ewm",
    trackTitle: "SAP EWM on S/4HANA",
    fromProfile: "SAP MM consultant (2 yrs)",
    toRole: "EWM Consultant — 3PL implementation partner",
    timelineMonths: 4,
    effortNote: "Weekend cohort; prior MM configuration background",
    deliverables: [
      "Wave-managed outbound flow with RF pick-pack simulation",
      "Slotting & replenishment configuration set",
      "Integration test scripts and cutover plan",
    ],
    isRepresentative: true,
  },
];

export const methodologySteps: MethodologyStep[] = [
  {
    step: 1,
    title: "Live System Access From Week One",
    description:
      "You work on a live SAP S/4HANA sandbox (or real cloud infrastructure in the full-stack track) from the first module — not slides, not simulations. Every concept session is followed by hands-on work in the same system delivery teams use.",
    proofPoints: [
      "Individual S/4HANA sandbox login for the full cohort",
      "Transport-cycle practice in the ABAP track",
      "AWS deployment in the full-stack track",
    ],
  },
  {
    step: 2,
    title: "Real-World Business Scenarios",
    description:
      "Labs are built from delivery-style scenarios: a purchase order that must be validated, a month-end close that must reconcile, an ASN that must land in the right bin. You practise the decisions, not just the menu paths.",
    proofPoints: [
      "Scenario-based labs in every module",
      "Cross-module integration exercises",
      "Exception and error-handling practice",
    ],
  },
  {
    step: 3,
    title: "Capstone You Can Defend",
    description:
      "Every track ends with a capstone project specified like a real engagement — blueprint, build, test, and present. It becomes the centrepiece of your portfolio and the artefact you defend in mock interviews.",
    proofPoints: [
      "Client-style configuration blueprint deliverable",
      "Scripted integration test walkthrough",
      "Recorded project defence with written feedback",
    ],
  },
  {
    step: 4,
    title: "Interview-Ready, Honestly",
    description:
      "Mock technical interviews with written feedback, resume reviews anchored to your actual deliverables, and question banks from real interview loops. We prepare you to demonstrate skill — we don't inflate outcomes.",
    proofPoints: [
      "Two recorded mock interviews per participant",
      "40+ question banks per track",
      "Trainer-reviewed resume & portfolio review",
    ],
  },
];

export const outcomeDisclosures = {
  snapshotNote:
    "Snapshots are anonymised and, where marked, representative composites of participant journeys. Timelines reflect cohort duration plus typical interview windows; they are not guaranteed.",
  guaranteeNote:
    "Syvaxia does not offer job or salary guarantees. We guarantee curriculum rigour, live system access, reviewed deliverables, and interview preparation.",
} as const;
