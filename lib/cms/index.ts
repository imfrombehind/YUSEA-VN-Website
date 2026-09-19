/**
 * The content facade.
 *
 * Components import from here and nowhere else. Each getter returns fixtures
 * until WORDPRESS_GRAPHQL_URL is present in the environment, at which point
 * the same call hits WPGraphQL and returns the identical shape.
 *
 * To go live: set WORDPRESS_GRAPHQL_URL in .env.local. That is the whole
 * switch — no component edits.
 */

import { wpQuery } from "./client";
import { mapHomepage, mapProjects, mapSiteSettings } from "./mappers";
import {
  HOMEPAGE_QUERY,
  PROJECTS_QUERY,
  SITE_SETTINGS_QUERY,
} from "./queries";
import {
  fixtureHomepage,
  fixtureProjects,
  fixtureSiteSettings,
} from "./fixtures";
import type { Homepage, Project, SiteSettings } from "./types";

/** True once WordPress is wired up. */
export function isCmsConnected(): boolean {
  return Boolean(process.env.WORDPRESS_GRAPHQL_URL);
}

/**
 * While the CMS is still being built, a thrown error should not blank the
 * page — fall back to fixtures and log loudly instead.
 */
async function withFallback<T>(
  label: string,
  fetcher: () => Promise<T>,
  fallback: T,
): Promise<T> {
  if (!isCmsConnected()) return fallback;

  try {
    return await fetcher();
  } catch (error) {
    console.error(`[cms] ${label} failed, serving fixtures instead.`, error);
    return fallback;
  }
}

export function getSiteSettings(): Promise<SiteSettings> {
  return withFallback(
    "getSiteSettings",
    async () =>
      mapSiteSettings(
        await wpQuery(SITE_SETTINGS_QUERY, { tags: ["site-settings"] }),
      ),
    fixtureSiteSettings,
  );
}

export function getHomepage(): Promise<Homepage> {
  return withFallback(
    "getHomepage",
    async () =>
      mapHomepage(await wpQuery(HOMEPAGE_QUERY, { tags: ["homepage"] })),
    fixtureHomepage,
  );
}

export function getProjects(): Promise<Project[]> {
  return withFallback(
    "getProjects",
    async () =>
      mapProjects(await wpQuery(PROJECTS_QUERY, { tags: ["projects"] })),
    fixtureProjects,
  );
}

export * from "./types";
