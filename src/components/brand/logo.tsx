import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Render mark + wordmark (false = mark + compact wordmark already in asset). */
  priority?: boolean;
}

/**
 * Syvaxia brand lockup — the official logo asset contains the pinwheel
 * mark, "SYVAXIA" wordmark and the "Where passion meets innovation"
 * tagline, so a single <Image> renders the full lockup.
 */
export function Logo({ className, priority = false }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Syvaxia — home"
      className={cn("inline-flex items-center rounded-sm", className)}
    >
      <Image
        src="/logo.png?v=3"
        alt="Syvaxia — Where passion meets innovation"
        width={489}
        height={138}
        priority={priority}
        className="h-10 w-auto md:h-11"
      />
    </Link>
  );
}
