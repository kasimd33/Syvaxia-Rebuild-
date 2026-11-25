import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="container flex flex-col items-center gap-6 py-24 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Compass className="size-7 text-brand-600" aria-hidden />
      </div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="max-w-md leading-relaxed text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Explore our course
        tracks or head back home.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="brand" asChild>
          <Link href="/courses">Explore Courses</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </section>
  );
}
