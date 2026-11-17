import type { AboutPage, Project, Publication, Term } from "@/lib/cms/types";

/**
 * URL builders for /work, so links to a project or publication are written
 * in one place and match the app/work route tree.
 */

export const WORK_PATH = "/work";
export const PROJECTS_PATH = "/work/projects";
export const PUBLICATIONS_PATH = "/work/publications";

export function projectHref(slug: string): string {
  return `${PROJECTS_PATH}/${slug}`;
}

/** `/work/projects/<slug>/programme`, optionally one day: `?day=2026-11-24`. */
export function programmeHref(slug: string, day?: string): string {
  return withQuery(`${projectHref(slug)}/programme`, { day });
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

/**
 * The /about sections that have content, as in-page anchors: the side nav
 * and the footer's About column. Each heading doubles as its link label.
 */
export function aboutSections(about: AboutPage | null): { id: string; label: string }[] {
  if (!about) return [];
  const { page, mission, focus, board } = about;
  return [
    { id: "who-we-are", label: page.header.heading },
    ...(mission.points.length ? [{ id: "mission", label: mission.heading }] : []),
    ...(focus.pillars.length ? [{ id: "our-focus", label: focus.heading }] : []),
    ...(board.members.length ? [{ id: "board", label: board.heading }] : []),
  ].filter((section) => section.label);
}
