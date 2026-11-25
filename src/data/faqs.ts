/**
 * Site-wide FAQ dataset — powers the home page accordion and the
 * JSON-LD FAQPage structured data block.
 *
 * Every answer is structural and verifiable (cohort mechanics, system
 * access, support model) — no placement-rate or salary guarantees.
 */

export interface Faq {
  question: string;
  answer: string;
}

export const globalFaqs: Faq[] = [
  {
    question: "How do Syvaxia cohorts actually work?",
    answer:
      "Every cohort runs live with a trainer — recorded video aftertoughts don't exist here. You attend scheduled sessions each week, work on a live SAP or development environment in every module, submit weekly lab work, and finish with a capstone project you present and defend. Cohort sizes are capped (20–30 seats) so every participant gets review time.",
  },
  {
    question: "Do I get access to real SAP systems, or just demo videos?",
    answer:
      "Real systems. Every SAP track includes live S/4HANA sandbox access for the full duration of the cohort — labs, exercises, and your capstone all run on it. Our full-stack cohort ships code to real cloud infrastructure (AWS free tier) through a CI/CD pipeline.",
  },
  {
    question: "What happens if I miss a live session?",
    answer:
      "Sessions are recorded for enrolled participants, and every cohort has an async doubt channel reviewed daily by the trainer. That said, cohorts are designed around live attendance — capstone reviews and mock interviews are interactive.",
  },
  {
    question: "Are jobs or placements guaranteed?",
    answer:
      "No — and you should be sceptical of anyone who promises that. What we guarantee is structural: a rigorous curriculum, live system access, reviewed portfolio deliverables, resume and interview preparation, and mock interviews with written feedback. Hiring outcomes depend on market conditions and your effort; we make you demonstrably interview-ready.",
  },
  {
    question: "Can working professionals manage the schedule?",
    answer:
      "Yes. Most cohorts run on evenings or weekends (typically 10–12 hours/week), and both weekday-evening and weekend formats exist for every track. If your team is joining through corporate L&D, schedules are negotiated directly with your organisation.",
  },
  {
    question: "Do you help with certification exams?",
    answer:
      "Our curricula align to SAP certification syllabi (ABAP, S/4HANA Finance, Sourcing & Procurement, EWM), and we provide practice question banks and exam-readiness reviews. Exam vouchers are not included in cohort fees — we guide you on booking directly with SAP.",
  },
  {
    question: "What does corporate training for teams look like?",
    answer:
      "Enterprise cohorts are scoped with your L&D team: you pick target modules, team size (5–100+), delivery mode (live virtual, onsite Bengaluru, or hybrid), and timeline. We run a structured consultation first, then deliver with progress reporting and skill assessments for your hiring or upskilling goals.",
  },
  {
    question: "How do I start — demo, syllabus, or a call?",
    answer:
      "Whichever suits you: book a free live demo with a trainer, download any syllabus PDF instantly by email, or request a callback. Every route starts on this site, and each form gives you a one-click WhatsApp option to continue the conversation.",
  },
];
