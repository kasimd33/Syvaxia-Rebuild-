import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution (shadcn/ui convention). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** "2026-02-07" → "7 Feb 2026" (IST-safe). */
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Clamp a number between min and max (slider helpers). */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Read UTM params from a URLSearchParams instance with a safe fallback. */
export function getUtmParam(params: URLSearchParams, key: string): string | undefined {
  const value = params.get(`utm_${key}`)?.trim();
  return value && value.length > 0 ? value.slice(0, 128) : undefined;
}

/** Client-side UTM capture for lead attribution (safe during SSR). */
export function getUtmParams(): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
} {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: getUtmParam(params, "source"),
    utmMedium: getUtmParam(params, "medium"),
    utmCampaign: getUtmParam(params, "campaign"),
  };
}
