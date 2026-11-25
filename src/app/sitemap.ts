import type { MetadataRoute } from "next";

import { courseSlugs } from "@/data/courses";
import { siteConfig } from "@/lib/constants";

/** Auto-generated XML sitemap (PRD Task 5.1) — prerendered at build time. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "", priority: 1 },
    { path: "/courses", priority: 0.9 },
    { path: "/enterprise", priority: 0.8 },
    { path: "/about", priority: 0.5 },
  ].map(({ path, priority }) => ({
    url: `${siteConfig.url}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority,
  }));

  const courseRoutes: MetadataRoute.Sitemap = courseSlugs.map((slug) => ({
    url: `${siteConfig.url}/courses/${slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticRoutes, ...courseRoutes];
}
