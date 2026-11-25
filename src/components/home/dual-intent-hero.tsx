"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  CalendarCheck,
  GraduationCap,
  Presentation,
  ShieldCheck,
  Star,
  TerminalSquare,
  Users,
} from "lucide-react";

import { useLeadModal } from "@/components/leads/lead-modal";
import Aurora from "@/components/ui/aurora";
import { Button } from "@/components/ui/button";
import { buildEnterpriseWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type Audience = "learner" | "enterprise";

interface IntentContent {
  eyebrow: string;
  headline: string;
  subcopy: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCta: { label: string; href: string };
  proof: { icon: React.ReactNode; text: string }[];
}

const learnerProof: IntentContent["proof"] = [
  { icon: <TerminalSquare className="size-4 shrink-0 text-brand-700" />, text: "Live S/4HANA sandbox in every track" },
  { icon: <ShieldCheck className="size-4 shrink-0 text-brand-700" />, text: "Capstone projects you present & defend" },
  { icon: <Users className="size-4 shrink-0 text-brand-700" />, text: "Cohorts capped at 20–30 seats" },
];

const enterpriseProof: IntentContent["proof"] = [
  { icon: <Users className="size-4 shrink-0 text-brand-700" />, text: "Cohorts for teams of 5–100+" },
  { icon: <CalendarCheck className="size-4 shrink-0 text-brand-700" />, text: "Progress reporting for your L&D team" },
  { icon: <ShieldCheck className="size-4 shrink-0 text-brand-700" />, text: "Assessment-backed outcomes, not certificates" },
];

const content: Record<Audience, IntentContent> = {
  learner: {
    eyebrow: "For Professionals & Graduates",
    headline: "Enterprise skills, trained on live systems",
    subcopy:
      "Train like a delivery consultant: real S/4HANA environments, scenario labs every module, and a capstone project you defend in mock interviews. Evenings & weekends, built around work.",
    primaryCtaLabel: "Book a Free Consultation",
    primaryCtaHref: "",
    secondaryCta: { label: "Explore All Tracks", href: "/courses" },
    proof: learnerProof,
  },
  enterprise: {
    eyebrow: "For Enterprise & Hiring Teams",
    headline: "Upskill your teams. Build your talent pipeline.",
    subcopy:
      "Scoped corporate cohorts for L&D teams: choose your modules, team size, and delivery mode — live virtual, onsite Bengaluru, or hybrid — with assessments and reporting you can act on.",
    primaryCtaLabel: "Build Your Corporate Cohort",
    primaryCtaHref: "/enterprise",
    secondaryCta: { label: "Hiring Pipeline Partnership", href: "/enterprise#hiring-pipeline" },
    proof: enterpriseProof,
  },
};

/* Forest-green stat cards floating over the hero panel — Veltro-style. */
const statCards = [
  { label: "Live system access", value: "100%", sub: "Every SAP track, week one" },
  { label: "Cohort size", value: "20–30", sub: "Everyone gets reviewed" },
  { label: "Capstone-defended", value: "100%", sub: "Recorded project defence" },
];

export function DualIntentHero() {
  const [audience, setAudience] = useState<Audience>("learner");
  const active = content[audience];
  const { openLeadModal } = useLeadModal();

  const enterpriseWhatsApp = buildEnterpriseWhatsAppUrl({
    modules: ["SAP", "Full Stack"],
  });

  const onSwitch = useCallback((next: string) => {
    if (next === "learner" || next === "enterprise") setAudience(next);
  }, []);

  return (
    <section className="relative overflow-hidden pb-10 pt-10 md:pt-14">
      {/* Soft mint wash backdrop */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-gradient-to-b from-brand-100/60 to-background"
        aria-hidden
      />

      <div className="container relative flex flex-col items-center gap-8 text-center">
        {/* Audience switcher — pills */}
        <div
          role="tablist"
          aria-label="Choose your audience"
          className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm"
        >
          {(
            [
              { value: "learner", label: "Professionals & Graduates", icon: <GraduationCap className="size-4" /> },
              { value: "enterprise", label: "Enterprise & Hiring Teams", icon: <Building2 className="size-4" /> },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={audience === tab.value}
              id={`hero-tab-${tab.value}`}
              onClick={() => onSwitch(tab.value)}
              className={cn(
                "inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                audience === tab.value
                  ? "bg-brand-300 text-navy-950 shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic content — keyed block prevents layout shift */}
        <div
          key={audience}
          role="tabpanel"
          aria-labelledby={`hero-tab-${audience}`}
          className="flex animate-fade-up flex-col items-center gap-6"
        >
          <h1 className="max-w-4xl text-balance font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            {active.headline}
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {active.subcopy}
          </p>

          <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            {audience === "learner" ? (
              <Button
                size="lg"
                className="h-13 gap-2 px-7 text-base"
                onClick={() => openLeadModal({ intent: "demo" })}
              >
                {active.primaryCtaLabel}
                <ArrowUpRight className="size-5" />
              </Button>
            ) : (
              <Button size="lg" asChild className="h-13 gap-2 px-7 text-base">
                <Link href={active.primaryCtaHref}>
                  {active.primaryCtaLabel}
                  <ArrowUpRight className="size-5" />
                </Link>
              </Button>
            )}
            <Button size="lg" variant="outline" asChild className="h-13 px-7 text-base">
              <Link href={active.secondaryCta.href}>{active.secondaryCta.label}</Link>
            </Button>
          </div>

          {/* Trust strip — Veltro's "Review on Clutch" slot */}
          <div className="flex flex-col items-center gap-2 pt-1 sm:flex-row sm:gap-5">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="flex text-brand-600" aria-hidden>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 fill-brand-600" />
                ))}
              </span>
              Trainer-led cohorts
            </span>
            <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
            <span className="text-sm text-muted-foreground">
              Bengaluru · Live virtual · Hybrid
            </span>
          </div>
        </div>

        {/* Proof strip — swaps with audience */}
        <ul
          key={`proof-${audience}`}
          className="flex animate-fade-up flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-7"
        >
          {active.proof.map((item) => (
            <li key={item.text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
              {item.icon}
              {item.text}
            </li>
          ))}
        </ul>

        {/* Rounded brand panel with floating forest stat cards */}
        <div className="relative mt-4 w-full">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-brand-950 px-6 py-12 text-center shadow-[0_20px_60px_rgb(16,42,24,0.25)] sm:py-14 md:py-16">
            {/* Animated ReactBits Aurora background — brand green palette */}
            <div className="absolute inset-0" aria-hidden>
              <Aurora
                colorStops={["#338f24", "#7ddd61", "#e2fadc"]}
                amplitude={1.2}
                blend={0.5}
                speed={0.5}
                height={0.55}
                glow={0.7}
                layers={2}
                direction="bottom"
                opacity={0.55}
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-950/70 via-brand-950/30 to-brand-950/80" aria-hidden />
            <div className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-10" aria-hidden />
            <div className="relative flex flex-col items-center gap-6">
              <div className="rounded-2xl bg-white p-4 shadow-lg">
                <Image
                  src="/logo.png?v=3"
                  alt="Syvaxia — Where passion meets innovation"
                  width={489}
                  height={138}
                  className="h-12 w-auto md:h-14"
                  priority
                />
              </div>
              <p className="max-w-md text-balance font-mono text-sm text-brand-200">
                Where passion meets innovation
              </p>

              {/* Stat cards — part of the panel, centered */}
              <div className="flex flex-wrap items-stretch justify-center gap-3">
                {statCards.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex-1 basis-40 rounded-2xl bg-brand-900/95 p-4 text-center text-white shadow-lg backdrop-blur"
                  >
                    <p className="text-xs text-brand-200">{stat.label}</p>
                    <p className="mt-1 font-display text-2xl font-bold">{stat.value}</p>
                    <p className="mt-0.5 text-[11px] text-brand-200/80">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
