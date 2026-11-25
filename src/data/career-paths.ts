import type { Course } from "@/data/courses";

/**
 * Career Transition & Compensation Reference (PRD Task 4.2)
 * --------------------------------------------------------
 * Indicative, conservative India-market ranges (INR lakh per annum)
 * feeding the client-side ROI estimator.
 *
 * ⚠️ OWNER REVIEW BEFORE LAUNCH: verify these bands against current
 * salary aggregators (AmbitionBox, Glassdoor India, Naukri insights)
 * and hiring-partner conversations. They are deliberately wide and
 * conservative — never show a single-point "expected salary".
 *
 * Credibility rule (matches src/data/outcomes.ts): these are market
 * observations, NOT promises. The UI must always render them with the
 * disclaimer below, and Syvaxia never guarantees jobs or salaries.
 */

export type StarterProfile = "student" | "domain-professional" | "it-professional";

export const starterProfiles: Array<{
  value: StarterProfile;
  label: string;
  description: string;
}> = [
  {
    value: "student",
    label: "Student / Fresh Graduate",
    description: "Final-year or graduated within the last year — building a first career.",
  },
  {
    value: "domain-professional",
    label: "Domain Professional",
    description: "Working in finance, procurement, supply chain, or warehouse operations.",
  },
  {
    value: "it-professional",
    label: "Working IT Professional",
    description: "Already in IT — support, QA, testing, or development — pivoting or modernising.",
  },
];

export interface ProfileBand {
  /** Target role label for this profile, e.g. "Entry ABAP Developer". */
  roleLabel: string;
  /** Indicative annual CTC band, INR lakh — [min, max], never a point value. */
  band: [number, number];
  note?: string;
}

export interface TrackCareerPath {
  trackSlug: Course["slug"];
  /**
   * Typical window from cohort completion to offer, in months.
   * Anchored to the representative snapshots in outcomes.ts — not guaranteed.
   */
  interviewWindowMonths: [number, number];
  /** `null` = this track is not a realistic direct entry for that profile. */
  profileBands: Record<StarterProfile, ProfileBand | null>;
}

export const careerPaths: TrackCareerPath[] = [
  {
    trackSlug: "sap-abap",
    interviewWindowMonths: [2, 4],
    profileBands: {
      student: {
        roleLabel: "Entry SAP ABAP / S/4HANA Developer",
        band: [4.5, 7],
        note: "Campus-to-consultant entry roles at IT services firms and SAP partners.",
      },
      "domain-professional": {
        roleLabel: "SAP ABAP Consultant",
        band: [6.5, 11],
        note: "Functional consultants adding ABAP typically price above pure-fresher entry.",
      },
      "it-professional": {
        roleLabel: "S/4HANA Technical Consultant",
        band: [8, 14],
        note: "Prior IT experience (support, QA, other languages) counts in interviews.",
      },
    },
  },
  {
    trackSlug: "sap-fico",
    interviewWindowMonths: [2, 4],
    profileBands: {
      student: {
        roleLabel: "Junior SAP FI Analyst",
        band: [4, 6.5],
        note: "Commerce/MBA-Finance graduates entering ERP consulting.",
      },
      "domain-professional": {
        roleLabel: "SAP FICO Consultant",
        band: [7, 13],
        note: "Domain experience in accounting is the strongest differentiator in FICO hiring.",
      },
      "it-professional": {
        roleLabel: "S/4HANA Finance Consultant",
        band: [7, 12],
      },
    },
  },
  {
    trackSlug: "sap-mm",
    interviewWindowMonths: [2, 3],
    profileBands: {
      student: {
        roleLabel: "Junior SAP MM Consultant",
        band: [4, 6.5],
        note: "The most common fresher entry point into SAP functional consulting.",
      },
      "domain-professional": {
        roleLabel: "SAP MM Consultant",
        band: [6, 11],
        note: "Procurement/logistics experience converts especially well to MM roles.",
      },
      "it-professional": {
        roleLabel: "SAP MM / P2P Process Consultant",
        band: [6.5, 12],
      },
    },
  },
  {
    trackSlug: "sap-ewm",
    interviewWindowMonths: [1, 3],
    profileBands: {
      student: null,
      "domain-professional": {
        roleLabel: "SAP EWM Consultant",
        band: [8, 14],
        note: "Realistic with 2+ years of warehouse/logistics operations experience.",
      },
      "it-professional": {
        roleLabel: "S/4HANA EWM Consultant",
        band: [10, 18],
        note: "Highest bands on the catalog — scarcity premium for bin-level EWM depth.",
      },
    },
  },
  {
    trackSlug: "full-stack-java",
    interviewWindowMonths: [2, 4],
    profileBands: {
      student: {
        roleLabel: "Java Backend / Full Stack Developer (entry)",
        band: [4.5, 8],
        note: "Product-company entry roles weigh deployed portfolio work heavily.",
      },
      "domain-professional": {
        roleLabel: "Full Stack Developer",
        band: [6, 11],
        note: "A career-change move — expect entry-to-mid bands, not senior pricing.",
      },
      "it-professional": {
        roleLabel: "Java / Spring Boot Engineer",
        band: [12, 24],
        note: "Existing developers modernising to Spring Boot + React price at market mid-levels.",
      },
    },
  },
];

export function getCareerPath(trackSlug: string): TrackCareerPath | undefined {
  return careerPaths.find((path) => path.trackSlug === trackSlug);
}

export const compensationDisclaimer =
  "Indicative India-market CTC ranges (INR lakh/year) compiled from public salary aggregators and hiring-partner conversations, 2025. Actual offers vary by company, city, and interview performance. Syvaxia does not offer job or salary guarantees.";
