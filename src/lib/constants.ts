import type { CourseCategory, DeliveryMode, ExperienceLevel } from "@/data/courses";

/**
 * Single source of truth for site-wide configuration.
 * Update contact details here — every component, WhatsApp deep link,
 * and email template reads from this object.
 */
export const siteConfig = {
  name: "Syvaxia",
  legalName: "Syvaxia Technologies",
  tagline: "Where passion meets innovation",
  description:
    "Enterprise SAP cohort training, technical upskilling, and B2B corporate L&D programs. Live system access, capstone projects, and role-based outcomes — engineered in Bengaluru.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://syvaxia.com",

  /**
   * ⚠️ REPLACE BEFORE LAUNCH: primary business WhatsApp/mobile number in
   * international format without '+' or spaces (country code + number).
   */
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919999999999",
  contactEmail: "hello@syvaxia.com",
  city: "Bengaluru",
  state: "Karnataka",
  country: "India",
  address: {
    street: "HSR Layout",
    city: "Bengaluru",
    region: "Karnataka",
    postalCode: "560102",
    country: "IN",
  },
  social: {
    linkedin: "https://www.linkedin.com/company/syvaxia",
    twitter: "https://twitter.com/syvaxia",
  },
} as const;

export const courseCategoryLabels: Record<CourseCategory, string> = {
  "sap-functional": "SAP Functional",
  "sap-technical": "SAP Technical",
  "full-stack-cloud": "Full Stack & Cloud",
};

export const courseCategoryDescriptions: Record<CourseCategory, string> = {
  "sap-functional": "Finance, supply chain & logistics processes on SAP S/4HANA.",
  "sap-technical": "ABAP development, HANA data modelling & extension suites.",
  "full-stack-cloud": "Modern software engineering: Java, Spring Boot, React & cloud.",
};

export const deliveryModeLabels: Record<DeliveryMode, string> = {
  "live-virtual": "Live Virtual",
  "onsite-bengaluru": "Onsite Bengaluru",
  hybrid: "Hybrid",
};

export const experienceLevelLabels: Record<ExperienceLevel, string> = {
  "fresher-friendly": "Fresher Friendly",
  professional: "Professional",
  advanced: "Advanced",
};

/** Used by JSON-LD Organization schema and footer. */
export const organizationSchema = {
  name: siteConfig.legalName,
  alternateName: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.png`,
  areaServed: "IN",
  city: siteConfig.city,
} as const;
