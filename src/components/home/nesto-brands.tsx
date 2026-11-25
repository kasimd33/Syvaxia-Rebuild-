import { LogoLoop } from "@/components/ui/logo-loop";

/**
 * Nesto Group brands marquee — a slowly scrolling loop of the group's
 * consumer brand logos, each linking to its page on nestogroup.com. Sits
 * between the hero and the featured tracks as proof of the Nesto
 * affiliation. Logo files live in /public/brands.
 */

const NESTO_BRANDS: { title: string; href: string; src: string; width: number; height: number }[] = [
  { title: "Last Chance", href: "https://nestogroup.com/brands/last-chance/", src: "/brands/last-chance.png", width: 400, height: 108 },
  { title: "Tasty Notes", href: "https://nestogroup.com/brands/tasty-notes/", src: "/brands/tasty-notes.png", width: 300, height: 83 },
  { title: "Haya Cafe", href: "https://nestogroup.com/brands/haya-cafe/", src: "/brands/haya-cafe.png", width: 400, height: 110 },
  { title: "Gala", href: "https://nestogroup.com/brands/gala-2/", src: "/brands/gala-1.png", width: 148, height: 88 },
  { title: "Yes Mobile", href: "https://nestogroup.com/brands/yes-mobile/", src: "/brands/yes-mobile.png", width: 200, height: 88 },
  { title: "Fun Today", href: "https://nestogroup.com/brands/funtoday/", src: "/brands/fun-today-logo.png", width: 300, height: 142 },
  { title: "Amandes", href: "https://nestogroup.com/brands/amandes/", src: "/brands/amandes.png", width: 118, height: 88 },
  { title: "Foodbook", href: "https://nestogroup.com/brands/foodbook/", src: "/brands/food-book.png", width: 210, height: 76 },
  { title: "VegMe", href: "https://nestogroup.com/brands/vegme/", src: "/brands/veg-me.png", width: 101, height: 91 },
  { title: "Super Karter", href: "https://nestogroup.com/brands/super-karter/", src: "/brands/super-karter.png", width: 210, height: 73 },
  { title: "Aina", href: "https://nestogroup.com/brands/aina/", src: "/brands/aina.png", width: 99, height: 93 },
  { title: "Sasya", href: "https://nestogroup.com/brands/sasya/", src: "/brands/sasya.png", width: 124, height: 88 },
];

export function NestoBrands() {
  return (
    <section className="border-y border-brand-900 bg-brand-950 py-8" aria-label="Nesto Group brands">
      <p className="mb-6 text-center text-sm font-semibold text-brand-200">
        Proudly part of the <span className="font-bold text-white">Nesto Group</span> ecosystem
      </p>
      <LogoLoop
        logos={NESTO_BRANDS.map((brand) => ({
          title: brand.title,
          href: brand.href,
          src: brand.src,
          width: brand.width,
          height: brand.height,
          alt: `${brand.title} — Nesto Group brand`,
        }))}
        speed={70}
        direction="left"
        logoHeight={36}
        gap={64}
        scaleOnHover
        fadeOutWidth={0.15}
        ariaLabel="Nesto Group brands"
      />
    </section>
  );
}
