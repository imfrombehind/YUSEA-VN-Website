import type { Project, Publication, Term } from "@/lib/cms/types";

/**
 * URL builders for /work, so links to a project or publication are written
 * in one place and match the app/work route tree.
 */

export function projectHref(slug: string): string {
  return `/work/projects/${slug}`;
}

export function publicationHref({ kind, slug }: Pick<Publication, "kind" | "slug">): string {
  return kind === "report"
    ? `/work/publications/reports/${slug}`
    : `/work/publications/blog/${slug}`;
}

/** `base` plus whichever params are set, e.g. `/work/publications?type=report`. */
export function withQuery(base: string, params: Record<string, string | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  const qs = query.toString();
  return qs ? `${base}?${qs}` : base;
}

/** `/work?pillar=urban-mobility` — the Our Focus "Explore more" target. */
export function pillarHref(pillar: string, base = "/work"): string {
  return withQuery(base, { pillar });
}

/** Next passes a repeated query key as an array; only the first counts. */
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Keeps only items tagged with the pillar. No pillar means no filter.
 *
 * WPGraphQL has no built-in taxonomy filter on connections (that needs the
 * tax-query extension), so this filters the fetched list instead. Fine at
 * this content volume; move it into the query if the lists grow past ~100.
 */
export function byPillar<T extends Project | Publication>(
  items: T[],
  pillar: string | undefined,
): T[] {
  if (!pillar) return items;
  return items.filter((item) => item.pillars.some((p: Term) => p.slug === pillar));
}
