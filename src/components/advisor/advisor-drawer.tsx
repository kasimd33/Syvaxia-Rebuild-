"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, MessageCircle, RotateCcw, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { buildLeadFollowUpWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

import type { AdvisorStreamEvent } from "@/types";

/**
 * AI Career Advisor drawer (PRD Task 4.1) — pure conversation.
 *
 * Opening the drawer starts a chat thread, like texting a counsellor.
 * The visitor types whatever they like; the advisor (POST /api/advisor,
 * NDJSON stream of AdvisorStreamEvents) replies conversationally, asks
 * its own follow-ups at most one at a time, and when it knows enough it
 * commits to the best-fit course from Syvaxia's actual curriculum —
 * rendered as an actionable course card. No scripted intake form.
 */

type ChatMessage = { role: "user" | "model"; content: string };

interface Recommendation {
  trackSlug: string;
  trackTitle: string;
  rationale: string;
  source: "ai" | "heuristic";
}

const GREETING =
  "Hi! 👋 I'm the Syvaxia Career Advisor. Tell me about yourself — your background, whether you enjoy coding, and what you're aiming for — and I'll point you to the best-fit course from our actual curriculum. What brings you here?";

export function AdvisorDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const greetedRef = useRef(false);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streaming, recommendation]);

  // Start the thread with the advisor's greeting, like a chat app.
  useEffect(() => {
    if (!open || greetedRef.current) return;
    greetedRef.current = true;
    setMessages([{ role: "model", content: GREETING }]);
  }, [open]);

  const runStream = async (body: {
    message: string;
    history: ChatMessage[];
  }) => {
    setStreaming(true);
    setError(null);

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok && response.status !== 429) {
        throw new Error(`Advisor request failed (${response.status})`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Streaming not supported in this browser");

      const decoder = new TextDecoder();
      let buffer = "";

      const processLine = (line: string) => {
        if (!line.trim()) return;
        let event: AdvisorStreamEvent;
        try {
          event = JSON.parse(line) as AdvisorStreamEvent;
        } catch {
          return;
        }

        switch (event.type) {
          case "recommendation":
            if (event.recommendation) {
              setRecommendation({
                trackSlug: event.recommendation.trackSlug,
                trackTitle: event.recommendation.trackTitle,
                rationale: event.recommendation.rationale,
                source: event.recommendation.source ?? "ai",
              });
            }
            break;
          case "text":
            if (event.content) {
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.role === "model") {
                  return [
                    ...prev.slice(0, -1),
                    { role: "model", content: last.content + event.content! },
                  ];
                }
                return [...prev, { role: "model", content: event.content! }];
              });
            }
            break;
          case "error":
            setError(event.content ?? "The advisor hit an error. Please try again.");
            break;
          case "done":
            break;
        }
      };

      // Read the NDJSON stream: split on newlines, keep the trailing partial line.
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) processLine(line);
      }
      if (buffer) processLine(buffer);
    } catch {
      setError(
        "Couldn't reach the advisor right now. You can retry, or continue on WhatsApp — a counsellor will give you the same guidance.",
      );
    } finally {
      setStreaming(false);
    }
  };

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");

    void runStream({
      message: trimmed,
      history: nextMessages.slice(-12),
    });
  };

  const restart = () => {
    setMessages([{ role: "model", content: GREETING }]);
    setRecommendation(null);
    setError(null);
    setInput("");
  };

  const lastModelMessage = [...messages].reverse().find((message) => message.role === "model");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md md:w-[28rem]"
      >
        <SheetHeader className="border-b p-5 pr-12">
          <SheetTitle className="flex items-center gap-2 font-display">
            <Sparkles className="size-5 text-brand-600" aria-hidden />
            AI Career Advisor
          </SheetTitle>
          <SheetDescription>
            Chat like you would with a counsellor — the advisor recommends the best-fit course
            from Syvaxia&apos;s actual curriculum once it knows you. No invented programs, no
            guarantees.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          {/* Conversation */}
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed",
                  message.role === "user"
                    ? "ml-auto bg-brand-600 text-white"
                    : "bg-muted text-foreground",
                )}
              >
                {message.content}
                {streaming && message === lastModelMessage && (
                  <span
                    className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-brand-500 align-middle"
                    aria-hidden
                  />
                )}
              </div>
            ))}

            {/* Typing indicator while waiting for the advisor's first chunk */}
            {streaming && !lastModelMessage && (
              <div
                className="flex w-16 items-center justify-center gap-1 rounded-lg bg-muted px-3 py-3"
                aria-label="Advisor is typing"
              >
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: `${dot * 150}ms` }}
                  />
                ))}
              </div>
            )}

            {/* Best-fit course card — appears the turn the advisor commits */}
            {recommendation && !streaming && (
              <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-900/30">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="brand">Best-fit course</Badge>
                  <span className="text-xs font-medium text-muted-foreground">
                    {recommendation.source === "ai" ? "AI-guided" : "Quick guidance"}
                  </span>
                </div>
                <p className="mt-2 font-display text-sm font-semibold leading-snug text-brand-900 dark:text-brand-100">
                  {recommendation.trackTitle}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-brand-900/80 dark:text-brand-100/80">
                  {recommendation.rationale}
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <Button variant="brand" size="sm" asChild className="gap-1.5">
                    <Link href={`/courses/${recommendation.trackSlug}`}>
                      View course & syllabus
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="gap-1.5 text-emerald-700"
                  >
                    <a
                      href={buildLeadFollowUpWhatsAppUrl({
                        track: {
                          title: recommendation.trackTitle,
                          slug: recommendation.trackSlug,
                        },
                        intent: "demo",
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="size-4" />
                      Book a free demo
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs leading-relaxed text-destructive"
              >
                {error}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full gap-1.5"
                  onClick={() => {
                    setError(null);
                    void runStream({
                      message: lastModelMessage
                        ? "Try again, please."
                        : (messages[messages.length - 1]?.content ?? "Which course fits me?"),
                      history: messages.slice(-12),
                    });
                  }}
                >
                  <RotateCcw className="size-3.5" />
                  Retry
                </Button>
              </div>
            )}
            <div ref={scrollAnchorRef} />
          </div>

          {/* Composer */}
          <div className="border-t p-4">
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
            >
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={streaming ? "Advisor is typing…" : "Type your message…"}
                disabled={streaming}
                maxLength={1000}
                aria-label="Message the AI career advisor"
              />
              <Button
                type="submit"
                variant="brand"
                size="icon"
                disabled={streaming || !input.trim()}
              >
                <ArrowRight className="size-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                Advice is grounded in our curriculum only.
              </p>
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3" />
                New chat
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
