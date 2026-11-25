"use client";

import Link from "next/link";
import { ArrowRight, Bot, Send, Sparkles, User } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { starterProfiles, type StarterProfile } from "@/data/career-paths";
import type { AdvisorStreamEvent } from "@/types";
import { cn } from "@/lib/utils";
import { buildWhatsAppUrlFromMessage } from "@/lib/whatsapp";
import { advisorRequestSchema } from "@/lib/validations";

/**
 * AI Career Advisor widget (PRD Task 4.1).
 *
 * Guided 3-step profile (background → coding comfort → goal) produces the
 * first recommendation from POST /api/advisor, then a free-form chat lets
 * the visitor drill into the track. The NDJSON event stream renders the
 * conversational reply progressively; the recommendation card always links
 * to the real course page and hands off to WhatsApp for validation with a
 * human counsellor — the AI advises, Syvaxia closes.
 */

type CodingComfort = "none" | "basic" | "confident";

const codingComfortOptions: Array<{ value: CodingComfort; label: string; hint: string }> = [
  { value: "none", label: "New to coding", hint: "No programming background" },
  { value: "basic", label: "Basic", hint: "Academic-level or light scripting" },
  { value: "confident", label: "Confident", hint: "I code (or coded) regularly" },
];

interface Recommendation {
  trackSlug: string;
  trackTitle: string;
  rationale: string;
  source?: "ai" | "heuristic";
}

interface ChatTurn {
  role: "user" | "model";
  content: string;
}

export function CareerAdvisor() {
  // ── Guided profile ──
  const [background, setBackground] = useState<StarterProfile | "">("");
  const [codingComfort, setCodingComfort] = useState<CodingComfort | null>(null);
  const [goal, setGoal] = useState("");

  // ── Advisor state ──
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followUp, setFollowUp] = useState("");

  const chatLogRef = useRef<HTMLDivElement>(null);

  const advisorDisabled = !background || !codingComfort;

  function scrollChatToEnd() {
    requestAnimationFrame(() => {
      chatLogRef.current?.scrollTo({ top: chatLogRef.current.scrollHeight, behavior: "smooth" });
    });
  }

  async function requestAdvisor(message: string, history: ChatTurn[]) {
    setIsLoading(true);
    setError(null);
    setStreamingText("");
    scrollChatToEnd();

    const payload = advisorRequestSchema.parse({
      message,
      history,
      profile: {
        background: starterProfiles.find((p) => p.value === background)?.label,
        codingComfort: codingComfort ?? undefined,
        goal: goal.trim() || undefined,
      },
    });

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok || !response.body) {
        const problem = (await response.json().catch(() => null)) as AdvisorStreamEvent | null;
        throw new Error(problem?.content ?? "The advisor is unavailable right now.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let reply = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as AdvisorStreamEvent;

          switch (event.type) {
            case "recommendation":
              if (event.recommendation) setRecommendation(event.recommendation);
              break;
            case "text":
              reply += event.content ?? "";
              setStreamingText(reply);
              scrollChatToEnd();
              break;
            case "error":
              throw new Error(event.content ?? "The advisor hit an error.");
            case "done":
              break;
          }
        }
      }

      if (reply) {
        setChatHistory((prev) => [
          ...prev,
          { role: "user", content: message },
          { role: "model", content: reply },
        ]);
      }
      setStreamingText("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The advisor hit an error. Please try again, or ask us on WhatsApp.",
      );
      setStreamingText("");
    } finally {
      setIsLoading(false);
      scrollChatToEnd();
    }
  }

  function handleStart(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (advisorDisabled) return;

    const message =
      goal.trim() ||
      `Recommend the best-fit Syvaxia track for my background and my goal of moving into a stronger role in the next 12 months.`;

    void requestAdvisor(message, chatHistory);
  }

  function handleFollowUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = followUp.trim();
    if (!message || isLoading) return;
    setFollowUp("");
    void requestAdvisor(message, chatHistory);
  }

  const whatsappHandoff = recommendation
    ? buildWhatsAppUrlFromMessage(
        [
          "Hi Syvaxia!",
          `Your AI advisor recommended the *${recommendation.trackTitle}* track for me.`,
          goal.trim() ? `My goal: ${goal.trim()}.` : "",
          "I'd like to validate this with a counsellor before enrolling.",
        ]
          .filter(Boolean)
          .join("\n"),
      )
    : null;

  return (
    <Card className="overflow-hidden border-brand-200 shadow-glow">
      <CardHeader className="border-b bg-brand-50 dark:bg-brand-900/30">
        <CardTitle className="flex items-center gap-2 font-display text-xl">
          <Bot className="size-5 text-brand-600" aria-hidden />
          AI Career Advisor
        </CardTitle>
        <CardDescription>
          Tell us your background and goal — get an honest, catalog-grounded track recommendation in
          seconds.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8 p-6">
        {/* ── Guided profile (collapses to a summary once recommended) ── */}
        {!recommendation && (
          <form onSubmit={handleStart} className="space-y-8" noValidate>
            <fieldset>
              <legend className="font-semibold">
                <span className="mr-2 font-mono text-sm text-brand-600">01</span>
                Where are you starting from?
              </legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {starterProfiles.map((profile) => {
                  const selected = background === profile.value;
                  return (
                    <button
                      key={profile.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setBackground(profile.value)}
                      className={cn(
                        "min-h-[76px] rounded-lg border p-3 text-left text-sm transition-all",
                        selected
                          ? "border-brand-600 bg-brand-50 shadow-sm dark:bg-brand-900/30"
                          : "border-border bg-background hover:border-brand-300",
                      )}
                    >
                      <span className="block font-medium">{profile.label}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                        {profile.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-semibold">
                <span className="mr-2 font-mono text-sm text-brand-600">02</span>
                How comfortable are you with code?
              </legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {codingComfortOptions.map((option) => {
                  const selected = codingComfort === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setCodingComfort(option.value)}
                      className={cn(
                        "min-h-[64px] rounded-lg border p-3 text-left text-sm transition-all",
                        selected
                          ? "border-brand-600 bg-brand-50 shadow-sm dark:bg-brand-900/30"
                          : "border-border bg-background hover:border-brand-300",
                      )}
                    >
                      <span className="block font-medium">{option.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {option.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-semibold">
                <span className="mr-2 font-mono text-sm text-brand-600">03</span>
                What's your goal? <span className="text-xs text-muted-foreground">(optional)</span>
              </legend>
              <Textarea
                className="mt-3"
                rows={3}
                maxLength={200}
                placeholder="e.g. Move from accounts into an SAP consulting role within a year"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
              />
            </fieldset>

            <Button
              type="submit"
              variant="brand"
              size="lg"
              disabled={advisorDisabled || isLoading}
              className="w-full gap-2"
            >
              <Sparkles className="size-4" />
              {isLoading ? "Analysing your profile…" : "Get My Track Recommendation"}
            </Button>
            {advisorDisabled && (
              <p className="text-center text-xs text-muted-foreground">
                Pick your starting point and coding comfort to continue.
              </p>
            )}
          </form>
        )}

        {/* ── Recommendation card ── */}
        {recommendation && (
          <div className="rounded-lg border border-brand-200 bg-gradient-to-br from-brand-50 to-background p-5 dark:border-brand-800 dark:from-brand-900/30">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Recommended track
              </span>
              {recommendation.source === "heuristic" && (
                <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Offline guidance
                </span>
              )}
            </div>
            <h3 className="mt-1.5 font-display text-lg font-bold leading-snug">
              {recommendation.trackTitle}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {recommendation.rationale}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button variant="brand" size="sm" asChild className="gap-1.5">
                <Link href={`/courses/${recommendation.trackSlug}`}>
                  View this track
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              {whatsappHandoff && (
                <Button variant="outline" size="sm" asChild className="gap-1.5 text-emerald-700">
                  <a href={whatsappHandoff} target="_blank" rel="noopener noreferrer">
                    Validate with a counsellor
                  </a>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRecommendation(null);
                  setChatHistory([]);
                  setStreamingText("");
                  setError(null);
                }}
              >
                Start over
              </Button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              AI-generated guidance grounded in our course catalog — not an admission decision. Talk
              to a human counsellor before enrolling.
            </p>
          </div>
        )}

        {/* ── Conversation ── */}
        {(chatHistory.length > 0 || streamingText || isLoading) && (
          <div
            ref={chatLogRef}
            className="max-h-96 space-y-3 overflow-y-auto rounded-lg border bg-background p-4"
            aria-live="polite"
          >
            {chatHistory.map((turn, index) => (
              <div key={index} className="flex gap-2.5">
                <span
                  className={cn(
                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                    turn.role === "user"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-brand-600 text-white",
                  )}
                >
                  {turn.role === "user" ? (
                    <User className="size-3.5" aria-hidden />
                  ) : (
                    <Bot className="size-3.5" aria-hidden />
                  )}
                </span>
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    turn.role === "user" ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {turn.content}
                </p>
              </div>
            ))}

            {(streamingText || isLoading) && (
              <div className="flex gap-2.5">
                <span className="mt-0.5 flex size-6 shrink-0 animate-pulse items-center justify-center rounded-full bg-brand-600 text-white">
                  <Bot className="size-3.5" aria-hidden />
                </span>
                <p className="text-sm leading-relaxed text-foreground">
                  {streamingText || "Thinking…"}
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        {/* ── Follow-up input ── */}
        {recommendation && (
          <form onSubmit={handleFollowUp} className="flex gap-2" noValidate>
            <Textarea
              rows={2}
              maxLength={1000}
              placeholder="Ask a follow-up — e.g. “How does this fit with 3 years of QA experience?”"
              value={followUp}
              onChange={(event) => setFollowUp(event.target.value)}
              className="min-h-0 flex-1"
              aria-label="Ask the advisor a follow-up question"
            />
            <Button
              type="submit"
              size="icon"
              variant="brand"
              disabled={!followUp.trim() || isLoading}
              aria-label="Send follow-up question"
            >
              <Send className="size-4" />
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
