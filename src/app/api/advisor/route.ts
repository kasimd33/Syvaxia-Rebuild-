import { getRecommendation } from "@/lib/advisor";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { advisorRequestSchema } from "@/lib/validations";

/**
 * POST /api/advisor — AI Career Advisor endpoint (PRD Task 4.1).
 *
 * Validates with the shared Zod schema, rate-limits per IP to protect the
 * Gemini free tier, and responds with a newline-delimited JSON event
 * stream matching `AdvisorStreamEvent` (src/types/index.ts):
 *
 *   {"type":"recommendation","recommendation":{...}}
 *   {"type":"text","content":"..."}
 *   ...
 *   {"type":"done"}
 *
 * Errors surface as a single {"type":"error","content":"..."} event so
 * the client keeps its conversation state and can retry.
 */

export const runtime = "edge";

const RATE_LIMIT_REQUESTS = 20;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function jsonEvent(event: unknown): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

export async function POST(request: Request) {
  const limit = rateLimit(
    `advisor:${getClientIp(request.headers)}`,
    RATE_LIMIT_REQUESTS,
    RATE_LIMIT_WINDOW_MS,
  );

  if (!limit.ok) {
    return new Response(
      JSON.stringify({
        type: "error",
        content: `Too many requests — please try again in ${limit.retryAfterSeconds}s, or ask us directly on WhatsApp.`,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(limit.retryAfterSeconds),
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ type: "error", content: "Request body must be valid JSON." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const parsed = advisorRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ type: "error", content: "Please complete your profile and question." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const recommendation = await getRecommendation(parsed.data);

        // The advisor chats first; the course card only ships on the turn
        // it actually commits to a track.
        if (recommendation.trackSlug && recommendation.trackTitle) {
          controller.enqueue(
            jsonEvent({
              type: "recommendation",
              recommendation: {
                trackSlug: recommendation.trackSlug,
                trackTitle: recommendation.trackTitle,
                rationale: recommendation.rationale,
                source: recommendation.source,
              },
            }),
          );
        }

        // Stream the conversational reply in word groups so the client
        // can render it progressively.
        const words = recommendation.reply.split(/(\s+)/);
        let chunk = "";
        for (const word of words) {
          chunk += word;
          if (chunk.length >= 24) {
            controller.enqueue(jsonEvent({ type: "text", content: chunk }));
            chunk = "";
          }
        }
        if (chunk) controller.enqueue(jsonEvent({ type: "text", content: chunk }));

        controller.enqueue(jsonEvent({ type: "done" }));
      } catch (error) {
        console.error("[advisor] stream failure:", error);
        controller.enqueue(
          jsonEvent({
            type: "error",
            content:
              "The advisor hit an unexpected error. Please try again, or continue on WhatsApp — a counsellor will give you the same guidance.",
          }),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
