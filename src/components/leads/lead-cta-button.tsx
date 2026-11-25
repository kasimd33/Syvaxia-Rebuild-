"use client";

import { useLeadModal } from "@/components/leads/lead-modal";
import { Button } from "@/components/ui/button";
import type { LeadIntent } from "@/lib/validations";

interface LeadCtaButtonProps {
  intent?: LeadIntent;
  trackSlug?: string;
  children: React.ReactNode;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
}

/**
 * Server-component-safe button that opens the global lead modal.
 * Use anywhere a conversion CTA is needed (hero, CTA bands, cards).
 */
export function LeadCtaButton({
  intent,
  trackSlug,
  children,
  variant = "brand",
  size,
  className,
}: LeadCtaButtonProps) {
  const { openLeadModal } = useLeadModal();

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => openLeadModal({ intent, trackSlug })}
    >
      {children}
    </Button>
  );
}
