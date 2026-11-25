"use client";

import { Search, SearchX, X } from "lucide-react";
import { useMemo, useState } from "react";

import { CourseCard } from "@/components/courses/course-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { courses, type Course, type CourseCategory, type DeliveryMode, type ExperienceLevel } from "@/data/courses";
import {
  courseCategoryLabels,
  deliveryModeLabels,
  experienceLevelLabels,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

type CategoryFilter = CourseCategory | "all";
type LevelFilter = ExperienceLevel | "all";
type ModeFilter = DeliveryMode | "all";

/** Multi-tag filter state — "all" means the facet is unfiltered. */
interface Filters {
  category: CategoryFilter;
  level: LevelFilter;
  mode: ModeFilter;
}

const DEFAULT_FILTERS: Filters = { category: "all", level: "all", mode: "all" };

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </legend>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex min-h-[40px] items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors",
              value === option.value
                ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                : "border-border bg-background text-muted-foreground hover:border-brand-300 hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Interactive Course & Track Explorer — real-time search plus
 * multi-tag filters (Domain, Experience Level, Delivery Mode).
 * All filtering is client-side over the typed catalog: instant, zero API cost.
 */
export function CourseExplorer({ catalog }: { catalog?: Course[] }) {
  const source = catalog ?? courses;
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return source.filter((course) => {
      if (filters.category !== "all" && course.category !== filters.category) return false;
      if (filters.level !== "all" && course.level !== filters.level) return false;
      if (filters.mode !== "all" && !course.deliveryModes.includes(filters.mode)) return false;

      if (normalizedQuery.length === 0) return true;

      // Search across title, code, tagline, tools, roles and module topics.
      const haystack = [
        course.title,
        course.shortTitle,
        course.tagline,
        course.code ?? "",
        ...course.tools,
        ...course.roles,
        ...course.modules.flatMap((module) => [module.title, ...module.topics]),
      ]
        .join(" ")
        .toLowerCase();

      return normalizedQuery.split(/\s+/).every((term) => haystack.includes(term));
    });
  }, [source, query, filters]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    filters.category !== "all" ||
    filters.level !== "all" ||
    filters.mode !== "all";

  return (
    <div className="space-y-8">
      {/* Search + filters */}
      <div className="space-y-4 rounded-lg border bg-card p-4 shadow-card md:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search courses, tools, roles, or topics — e.g. “CDS views”, “COPA”, “Spring Boot”…"
            aria-label="Search courses"
            className="h-12 pl-10 pr-10"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FilterGroup<CategoryFilter>
            label="Domain"
            value={filters.category}
            onChange={(category) => setFilters((prev) => ({ ...prev, category }))}
            options={[
              { value: "all", label: "All" },
              { value: "sap-functional", label: courseCategoryLabels["sap-functional"] },
              { value: "sap-technical", label: courseCategoryLabels["sap-technical"] },
              { value: "full-stack-cloud", label: courseCategoryLabels["full-stack-cloud"] },
            ]}
          />
          <FilterGroup<LevelFilter>
            label="Experience Level"
            value={filters.level}
            onChange={(level) => setFilters((prev) => ({ ...prev, level }))}
            options={[
              { value: "all", label: "All" },
              { value: "fresher-friendly", label: experienceLevelLabels["fresher-friendly"] },
              { value: "professional", label: experienceLevelLabels.professional },
              { value: "advanced", label: experienceLevelLabels.advanced },
            ]}
          />
          <FilterGroup<ModeFilter>
            label="Delivery Mode"
            value={filters.mode}
            onChange={(mode) => setFilters((prev) => ({ ...prev, mode }))}
            options={[
              { value: "all", label: "All" },
              { value: "live-virtual", label: deliveryModeLabels["live-virtual"] },
              { value: "onsite-bengaluru", label: deliveryModeLabels["onsite-bengaluru"] },
              { value: "hybrid", label: deliveryModeLabels.hybrid },
            ]}
          />
        </div>
      </div>

      {/* Result count + reset */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "track" : "tracks"} found
        </p>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setFilters(DEFAULT_FILTERS);
            }}
          >
            <X className="size-4" />
            Reset filters
          </Button>
        )}
      </div>

      {/* Grid / empty state */}
      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
          <SearchX className="size-10 text-muted-foreground/50" aria-hidden />
          <div>
            <p className="font-medium">No tracks match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a broader search term or reset the filters.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setQuery("");
              setFilters(DEFAULT_FILTERS);
            }}
          >
            Reset all filters
          </Button>
        </div>
      )}
    </div>
  );
}
