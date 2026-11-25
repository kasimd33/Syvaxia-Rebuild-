"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Sparkles } from "lucide-react";

/**
 * Floating AI Advisor entry point.
 * The chat drawer (and its ~15 kB of chat/streaming logic) is code-split
 * and only fetched on first open, keeping the initial route bundle lean.
 */
const AdvisorDrawer = dynamic(() => import("./advisor-drawer").then((mod) => mod.AdvisorDrawer), {
  ssr: false,
});

export function AdvisorLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-50 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Sparkles className="size-5" aria-hidden />
        Ask our AI advisor
      </button>
      <AdvisorDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}
