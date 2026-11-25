import { LogoLoop } from "@/components/ui/logo-loop";

/**
 * Nesto Group brands marquee — a slowly scrolling loop of the group's
 * consumer brands, each linking to its page on nestogroup.com. Sits
 * between the hero and the featured tracks as proof of the Nesto
 * affiliation. Brand marks are text pills (no image assets), styled to
 * match the site's chip language.
 */

const NESTO_BRANDS: { title: string; href: string }[] = [
  { title: "Last Chance", href: "https://nestogroup.com/brands/last-chance/" },
  { title: "Tasty Notes", href: "https://nestogroup.com/brands/tasty-notes/" },
  { title: "Haya Cafe", href: "https://nestogroup.com/brands/haya-cafe/" },
  { title: "Gala", href: "https://nestogroup.com/brands/gala-2/" },
  { title: "Yes Mobile", href: "https://nestogroup.com/brands/yes-mobile/" },
  { title: "Fun Today", href: "https://nestogroup.com/brands/funtoday/" },
  { title: "Amandes", href: "https://nestogroup.com/brands/amandes/" },
  { title: "Foodbook", href: "https://nestogroup.com/brands/foodbook/" },
  { title: "VegMe", href: "https://nestogroup.com/brands/vegme/" },
  { title: "Super Karter", href: "https://nestogroup.com/brands/super-karter/" },
  { title: "Aina", href: "https://nestogroup.com/brands/aina/" },
  { title: "Sasya", href: "https://nestogroup.com/brands/sasya/" },
];

export function NestoBrands() {
  return (
    <section className="border-y border-border bg-white py-8" aria-label="Nesto Group brands">
      <p className="mb-6 text-center text-sm font-semibold text-muted-foreground">
        Proudly part of the <span className="font-bold text-brand-700">Nesto Group</span> ecosystem
      </p>
      <LogoLoop
        logos={NESTO_BRANDS.map((brand) => ({
          title: brand.title,
          href: brand.href,
          node: (
            <span
              className="inline-flex items-center whitespace-nowrap rounded-full border border-brand-700/35 bg-white px-4 py-1.5 text-sm font-semibold text-brand-800"
            >
              {brand.title}
            </span>
          ),
        }))}
        speed={70}
        direction="left"
        logoHeight={24}
        gap={44}
        scaleOnHover
        fadeOutWidth={0.15}
        ariaLabel="Nesto Group brands"
      />
    </section>
  );
}
