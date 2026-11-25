import Link from "next/link";
import { Mail, MapPin, MessageCircle } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { courses } from "@/data/courses";
import { siteConfig } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const pageLinks = [
  { href: "/courses", label: "Course Explorer" },
  { href: "/enterprise", label: "Enterprise L&D" },
  { href: "/advisor", label: "AI Career Advisor" },
  { href: "/about", label: "About Syvaxia" },
] as const;

export function Footer() {
  const whatsappUrl = buildWhatsAppUrl();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-navy-900 text-navy-100">
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="space-y-4">
          <div className="inline-flex rounded-md bg-white p-2">
            <Logo />
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-navy-200">
            Enterprise SAP cohort training, technical upskilling, and corporate L&D — built on live
            systems and defended capstones.
          </p>
          <p className="font-mono text-xs text-navy-300">{siteConfig.tagline}</p>
        </div>

        {/* Pages */}
        <nav aria-label="Footer pages">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Platform</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {pageLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-navy-200 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Courses */}
        <nav aria-label="Footer courses">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Tracks</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {courses.map((course) => (
              <li key={course.slug}>
                <Link
                  href={`/courses/${course.slug}`}
                  className="text-navy-200 transition-colors hover:text-white"
                >
                  {course.shortTitle}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="flex items-center gap-2.5 text-navy-200 transition-colors hover:text-white"
              >
                <Mail className="size-4 shrink-0" aria-hidden />
                {siteConfig.contactEmail}
              </a>
            </li>
            <li>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-navy-200 transition-colors hover:text-white"
              >
                <MessageCircle className="size-4 shrink-0 text-emerald-400" aria-hidden />
                WhatsApp us
              </a>
            </li>
            <li className="flex items-start gap-2.5 text-navy-200">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                {siteConfig.address.city}, {siteConfig.address.region}, India
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-700">
        <div className="container flex flex-col gap-2 py-6 text-xs text-navy-300 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.legalName}. All rights reserved.
          </p>
          <p>Syvaxia does not offer job or salary guarantees — see our outcome disclosures.</p>
        </div>
      </div>
    </footer>
  );
}
