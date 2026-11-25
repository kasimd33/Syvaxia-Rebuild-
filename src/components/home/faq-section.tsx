import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { JsonLd } from "@/components/seo/json-ld";
import { SectionHeading } from "@/components/home/section-heading";
import { globalFaqs } from "@/data/faqs";
import { siteConfig } from "@/lib/constants";

/**
 * Global FAQ accordion + FAQPage JSON-LD structured data (PRD Task 5.1).
 * Server component — the schema block ships in the static HTML.
 */
export function FaqSection() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: globalFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: siteConfig.legalName,
    alternateName: siteConfig.name,
    slogan: siteConfig.tagline,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    email: siteConfig.contactEmail,
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.region,
      postalCode: siteConfig.address.postalCode,
      addressCountry: "IN",
    },
  };

  return (
    <section className="section-padding border-t bg-muted/40" aria-labelledby="faq-heading">
      {/* Structured data */}
      <JsonLd data={faqSchema} />
      <JsonLd data={organizationSchema} />

      <div className="container grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <SectionHeading
          id="faq-heading"
          align="left"
          eyebrow="Questions, Answered"
          title="What people ask before joining"
          description="Straight answers about cohort mechanics, system access, and what we do — and don't — guarantee."
        />

        <Accordion type="single" collapsible className="w-full rounded-lg border bg-card px-5">
          {globalFaqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
