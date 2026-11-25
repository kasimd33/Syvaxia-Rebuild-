"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, MessageCircle } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/enterprise", label: "Enterprise" },
  { href: "/advisor", label: "Career Advisor" },
  { href: "/about", label: "About" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const whatsappUrl = buildWhatsAppUrl();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-3 z-40 w-full px-3 sm:top-4">
      {/* Floating pill navbar — detached from the page edge, Veltro-style */}
      <div className="container">
        <nav
          aria-label="Primary"
          className="flex h-14 items-center justify-between gap-3 rounded-full border border-border/70 bg-card/90 pl-4 pr-2 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur supports-[backdrop-filter]:bg-card/75 md:h-16 md:pl-5"
        >
          <Logo />

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-brand-200/80 text-navy-950"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" asChild className="gap-1.5 text-brand-800">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
            </Button>
            <Button variant="dark" size="sm" asChild className="gap-1.5 px-4">
              <Link href="/courses">
                Explore Tracks
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile drawer */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="dark" size="icon" aria-label="Open navigation menu" className="size-10">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <SheetDescription className="sr-only">
                    Navigate to Syvaxia pages
                  </SheetDescription>
                </SheetHeader>
                <nav aria-label="Mobile" className="mt-6 flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "rounded-full px-4 py-3 text-base font-medium transition-colors hover:bg-accent",
                        isActive(link.href) ? "bg-brand-200/70 text-navy-950" : "text-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-6 flex flex-col gap-2 border-t pt-6">
                  <Button variant="dark" asChild className="h-12 gap-2">
                    <Link href="/courses">
                      Explore Tracks
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="h-12 gap-2 text-brand-800">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="size-4" />
                      Chat on WhatsApp
                    </a>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
