import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

import { courseSlugs, courses, getCourseBySlug } from "@/data/courses";
import { getServerEnv, isAdvisorEnabled } from "@/env";

import type { AdvisorRequest } from "@/lib/validations";

/**
 * AI Career Advisor — server-side conversational recommender (PRD Task 4.1).
 *
 * The advisor behaves like texting a counsellor: it chats naturally, asks
 * its own follow-up questions (at most one per turn), and only commits to
 * a course recommendation once it knows the visitor's background, coding
 * comfort, and goal. The model is grounded strictly in the canonical
 * catalog (`courses.ts`): it may only recommend one of the five live
 * tracks, and it must stay honest about fit (e.g. EWM is not a fresher
 * entry point). Output is JSON-validated before it reaches the client.
 *
 * Zero-cost resilience: when GEMINI_API_KEY is absent (or the call
 * fails), a deterministic rules-based flow keeps the chat functional —
 * it mirrors the same "ask, then recommend" rhythm, labelled "heuristic"
 * so the UI never claims AI advice.
 */

// ─── Recommendation contract ────────────────────────────────────────────────

/**
 * `trackSlug` stays null while the advisor is still gathering context;
 * the client renders the course card only when it resolves to a track.
 */
export const advisorRecommendationSchema = z.object({
  trackSlug: z.enum(courseSlugs as [string, ...string[]]).nullable(),
  rationale: z.string().trim().max(1200).default(""),
  reply: z.string().trim().min(1).max(2000),
});

export type AdvisorRecommendation = z.infer<typeof advisorRecommendationSchema> & {
  /** Resolved from canonical data — never trusted from model output. */
  trackTitle: string | null;
  /** "ai" = Gemini, "heuristic" = offline rules-based fallback. */
  source: "ai" | "heuristic";
};

// ─── Catalog grounding ──────────────────────────────────────────────────────

function summariseCourse(course: (typeof courses)[number]): string {
  return [
    `- slug: ${course.slug} | ${course.title}`,
    `  category: ${course.category} | level: ${course.level} | ${course.durationWeeks} weeks @ ${course.hoursPerWeek} h/week`,
    `  prerequisites: ${course.prerequisites.join("; ")}`,
    `  target roles: ${course.roles.join(", ")}`,
    `  good fit: ${course.recommendedFor.join("; ")}`,
  ].join("\n");
}

const catalogGrounding = courses.map(summariseCourse).join("\n");

const SYSTEM_INSTRUCTION = `You are the Syvaxia Career Advisor — a candid, encouraging counsellor texting with a visitor for a Bengaluru training institute that runs live cohort programs. This is a free-flowing WhatsApp-style conversation, not a form.

CONVERSATION STYLE
1. Talk naturally, like a friendly human counsellor over chat. React to what they actually say before moving on.
2. Ask at most ONE question per reply. Short replies (2–4 sentences). Never interrogate — weave questions into the conversation.
3. Your job across the conversation: understand (a) their background — education or work domain, (b) how comfortable they are with coding, (c) what goal they're working toward. If the user's first message already tells you these, skip the questions.
4. Never repeat a question they already answered. Never ask more than 3 questions total before recommending.

WHEN TO RECOMMEND
Once you know enough (or immediately if their message makes fit obvious), set "trackSlug" to the single best-fit track from the catalog below and write your guidance. Every reply after that should keep helping: answer follow-ups about the recommended track, compare alternatives honestly, and adjust the recommendation if they share new information.

CATALOG (recommend ONLY these slugs — never invent programs)
${catalogGrounding}

HARD RULES
- Never invent programs, salaries, placement rates, or guarantees.
- Be honest about fit. SAP EWM is advanced — students/freshers belong in SAP MM (or SAP ABAP if they can already code); say EWM is a later upskill.
- Match domain to track: finance/accounting → SAP FICO; supply chain/procurement/operations → SAP MM (EWM only with prior SAP/warehouse exposure); programming ability → SAP ABAP or Full Stack Java depending on whether they mention SAP.
- Keep the tone warm, specific, and practical. No exclamation-mark spam, no bullet-point walls. English (Indian context).
- "reply": your conversational message for this turn.
- "rationale": only when recommending — 2–3 sentences on why this track fits them (shown on the course card). Otherwise "".
- "trackSlug": null while still gathering context.`;

// ─── Gemini call ────────────────────────────────────────────────────────────

/**
 * gemini-2.5-flash is no longer available to new Google AI Studio accounts
 * (deprecated 2026); the API's deprecation notice names gemini-3.8-flash.
 * Override with GEMINI_MODEL if Google renames the current flash model.
 */
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface GeminiContent {
  role: "user" | "model";
  parts: [{ text: string }];
}

function buildContents(request: AdvisorRequest): GeminiContent[] {
  const contents: GeminiContent[] = request.history.map((turn) => ({
    role: turn.role,
    parts: [{ text: turn.content }],
  }));
  contents.push({ role: "user", parts: [{ text: request.message }] });
  return contents;
}

function resolveRecommendation(
  parsed: z.infer<typeof advisorRecommendationSchema>,
  source: AdvisorRecommendation["source"],
): AdvisorRecommendation | null {
  if (parsed.trackSlug === null) {
    // Still gathering context — no course card this turn.
    return { ...parsed, trackSlug: null, trackTitle: null, source };
  }
  const course = getCourseBySlug(parsed.trackSlug);
  if (!course) return null;
  return { ...parsed, trackSlug: course.slug, trackTitle: course.title, source };
}

async function callGemini(request: AdvisorRequest): Promise<AdvisorRecommendation | null> {
  const { GEMINI_API_KEY } = getServerEnv();
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const generate = () =>
    ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildContents(request),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trackSlug: { type: Type.STRING, nullable: true, enum: [...courseSlugs] },
            rationale: { type: Type.STRING },
            reply: { type: Type.STRING },
          },
          required: ["trackSlug", "rationale", "reply"],
          propertyOrdering: ["trackSlug", "rationale", "reply"],
        },
      },
    });

  // Free-tier 503s ("high demand") are transient — one retry after a short
  // backoff before handing off to the deterministic fallback.
  let response;
  try {
    response = await generate();
  } catch (error) {
    console.warn(`[advisor] first attempt failed (${GEMINI_MODEL}), retrying once:`, error);
    await sleep(2000);
    response = await generate();
  }

  const raw = response.text?.trim();
  if (!raw) return null;

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }

  const parsed = advisorRecommendationSchema.safeParse(json);
  if (!parsed.success) return null;

  return resolveRecommendation(parsed.data, "ai");
}

// ─── Deterministic fallback (no API key / API failure) ──────────────────────

const domainProfileRules: Array<{
  keywords: RegExp;
  trackSlug: string;
  rationale: string;
}> = [
  {
    keywords: /(finance|account|bookkeep|ca\b|commerce|audit|tax)/i,
    trackSlug: "sap-fico",
    rationale:
      "Your finance/accounting background maps directly to SAP FICO — hiring teams value domain knowledge alongside configuration skill, and the cohort builds configuration depth on a live S/4HANA system.",
  },
  {
    keywords: /(supply ?chain|procure|purchase|logistic|warehouse|store|operation|inventory)/i,
    trackSlug: "sap-mm",
    rationale:
      "Procurement, logistics, and operations experience is the natural on-ramp to SAP MM — the most common functional entry point, and the concepts will already feel familiar from your day-to-day work.",
  },
  {
    keywords: /(sap|abap)/i,
    trackSlug: "sap-abap",
    rationale:
      "You already have exposure to the SAP world and some coding ability, so the ABAP on S/4HANA track turns that into billable development skill — CDS views and RAP are what new S/4HANA projects are built with.",
  },
];

const codingRules: {
  none: { trackSlug: string; rationale: string };
  basic: { trackSlug: string; rationale: string };
  confident: { trackSlug: string; rationale: string };
} = {
  none: {
    trackSlug: "sap-mm",
    rationale:
      "Without prior coding, a functional track is the strongest start — SAP MM's concepts (buying, storing, invoicing) map to business logic everyone understands, and no programming is required.",
  },
  basic: {
    trackSlug: "sap-abap",
    rationale:
      "Basic programming comfort is exactly the entry bar for SAP ABAP — the cohort rebuilds your skills on modern S/4HANA tooling (CDS, AMDP, RAP) from foundations upward.",
  },
  confident: {
    trackSlug: "full-stack-java",
    rationale:
      "With confident coding ability, the Full Stack Java & React track gives you the widest market — Spring Boot microservices, React, Docker, and a deployed portfolio that product companies interview for.",
  },
};

/**
 * Conversational fallback: mirrors the "chat first, recommend when ready"
 * rhythm without an LLM. Returns a follow-up question (trackSlug null)
 * while key signals are missing from the conversation so far.
 */
function heuristicRecommendation(request: AdvisorRequest): AdvisorRecommendation {
  // Full turn order — model questions matter as much as user answers, so a
  // question is "answered" when ANY user reply follows it (a bare "no" or
  // "none yet" counts; keyword matching alone would loop forever).
  const turns: Array<{ role: "user" | "model"; content: string }> = [
    ...request.history,
    { role: "user", content: request.message },
  ];

  const haystack = turns
    .filter((turn) => turn.role === "user")
    .map((turn) => turn.content)
    .join(" ")
    .toLowerCase();

  /** True when a user message appears after the last model message matching `question`. */
  const answeredAfter = (question: RegExp): boolean => {
    let asked = false;
    for (const turn of turns) {
      if (turn.role === "model" && question.test(turn.content)) asked = true;
      else if (asked && turn.role === "user" && turn.content.trim().length > 0) return true;
    }
    return false;
  };

  const knowsBackground =
    /(background|student|graduate|fresher|working|professional|commerce|b\.?com|mba|engineer|degree|be\b|diploma|finance|account|supply|operation|it\b|software)/i.test(
      haystack,
    ) || answeredAfter(/about your background/i);

  const knowsComfort =
    /(cod(e|ing)|program|develop|never coded|non.coding|no coding|basic|confident|\bnone\b|\bno\b)/i.test(
      haystack,
    ) || answeredAfter(/comfortable with coding/i);

  const knowsGoal =
    /(goal|want|switch|move|land|grow|job|career|become|aim|transition)/i.test(haystack) ||
    answeredAfter(/what are you aiming for/i);

  // ── Not enough context yet → keep the conversation going ──
  if (!knowsBackground) {
    return {
      trackSlug: null,
      trackTitle: null,
      rationale: "",
      reply:
        "Happy to help you find the right course! To point you well — tell me a bit about your background: are you a student or working, and in what field?",
      source: "heuristic",
    };
  }
  if (!knowsComfort) {
    return {
      trackSlug: null,
      trackTitle: null,
      rationale: "",
      reply:
        "Got it, that helps. And how comfortable are you with coding — none yet, basic academic-level, or do you code regularly?",
      source: "heuristic",
    };
  }
  if (!knowsGoal) {
    return {
      trackSlug: null,
      trackTitle: null,
      rationale: "",
      reply:
        "Perfect. Last thing — what are you aiming for: switching into IT, landing your first job, or growing in your current role?",
      source: "heuristic",
    };
  }

  // ── Enough context → recommend ──
  const domainHit = domainProfileRules.find((rule) => rule.keywords.test(haystack));

  // Value detection uses the message that actually answered the comfort
  // question (falling back to keyword scan) so a stray "no" elsewhere in
  // the thread can't mislabel the coding-comfort level.
  const comfortAnswer = (() => {
    let asked = false;
    for (const turn of turns) {
      if (turn.role === "model" && /comfortable with coding/i.test(turn.content)) asked = true;
      else if (asked && turn.role === "user") return turn.content.toLowerCase();
    }
    return "";
  })();

  const comfort = /never|none|not really|\bno\b|non.coding|no coding/i.test(comfortAnswer)
    ? "none"
    : /confident|regular|daily|professional|yes/i.test(comfortAnswer)
      ? "confident"
      : /basic|little|some|academic/i.test(comfortAnswer)
        ? "basic"
        : /never coded|no coding|none|non.coding/i.test(haystack)
          ? "none"
          : /confident|regular|daily|professional/i.test(haystack)
            ? "confident"
            : "basic";
  const pick = domainHit ?? codingRules[comfort];

  const course = getCourseBySlug(pick.trackSlug);
  if (!course) throw new Error("Heuristic rule referenced an unknown track slug");

  const caveat =
    pick.trackSlug === "sap-ewm"
      ? " Note: EWM is an advanced track — most people enter through MM first and add EWM 6–12 months later."
      : "";

  const reply = [
    `Based on everything you've shared, my starting recommendation is the ${course.title} track.`,
    pick.rationale,
    `It runs ${course.durationWeeks} weeks at about ${course.hoursPerWeek} hours per week, and you work on a live system from the first module.${caveat}`,
    "Ask me anything about it — happy to go deeper on the curriculum.",
  ].join(" ");

  return {
    trackSlug: course.slug,
    trackTitle: course.title,
    rationale: pick.rationale + caveat,
    reply,
    source: "heuristic",
  };
}

/**
 * Resolves the best available recommendation: Gemini when provisioned,
 * deterministic rules otherwise (also used as the error fallback).
 */
export async function getRecommendation(request: AdvisorRequest): Promise<AdvisorRecommendation> {
  if (!isAdvisorEnabled()) return heuristicRecommendation(request);

  try {
    return (await callGemini(request)) ?? heuristicRecommendation(request);
  } catch (error) {
    console.error("[advisor] Gemini call failed, using heuristic fallback:", error);
    return heuristicRecommendation(request);
  }
}
