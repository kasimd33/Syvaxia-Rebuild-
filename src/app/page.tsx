import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

import { CareerTools } from "@/components/home/career-tools";
import { CircuitHero } from "@/components/home/circuit-hero";
import { FaqSection } from "@/components/home/faq-section";
import { FeaturedTracks } from "@/components/home/featured-tracks";
import { Methodology } from "@/components/home/methodology";
import { Outcomes } from "@/components/home/outcomes";
import { LeadCtaButton } from "@/components/leads/lead-cta-button";
import { Button } from "@/components/ui/button";
import { courses } from "@/data/courses";

/**
 * Dual-Intent Home Page.
 * Fully static (RSC) — interactivity (audience switcher, track filters,
 * FAQ accordion, lead modal) is isolated to small client components.
 */
export default function HomePage() {
  return (
    <>
      <CircuitHero />
      <FeaturedTracks courses={courses} />
      <CareerTools />
      <Methodology />
      <Outcomes />
      <FaqSection />

      {/* Final conversion band */}
      <section className="section-padding bg-navy-900 text-white">
        <div className="container flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-2xl text-balance font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Still deciding? Sit in on a live cohort session first.
          </h2>
          <p className="max-w-xl text-pretty leading-relaxed text-navy-200">
            Book a free demo with a trainer, get any syllabus PDF instantly by email, or message us
            on WhatsApp — whichever is easiest for you.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <LeadCtaButton
              intent="demo"
              size="lg"
              className="h-12 gap-2 px-7"
            >
              <MessageCircle className="size-5" />
              Book a Free Demo
            </LeadCtaButton>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 border-white/25 bg-transparent px-7 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/courses">
                Browse all tracks
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
