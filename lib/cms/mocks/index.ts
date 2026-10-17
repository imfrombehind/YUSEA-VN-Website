/**
 * Mock WPGraphQL responses, one per query in lib/cms/queries.ts.
 *
 * Each export is shaped exactly like `{ data }` from the real endpoint, so it
 * runs through the same mappers as live content. Edit the JSON files to
 * change what the site shows while WORDPRESS_USE_MOCKS is "true".
 */

import about from "./about.json";
import homepage from "./homepage.json";
import pages from "./pages.json";
import pillars from "./pillars.json";
import posts from "./posts.json";
import projects from "./projects.json";
import reports from "./reports.json";
import siteSettings from "./site-settings.json";

/** POSTS_QUERY / POST_BY_SLUG_QUERY source. */
export const mockPosts = posts.data;

/** PILLARS_QUERY: every pillar term, in admin order. */
export function mockPillars(pillarsFirst = 20) {
  return { pillars: { nodes: pillars.data.pillars.nodes.slice(0, pillarsFirst) } };
}

/** HOMEPAGE_QUERY: page ACF fields + the first pillars, as one response. */
export function mockHomepage(pillarsFirst = 3) {
  return { pageData: homepage.data.pageData, ...mockPillars(pillarsFirst) };
}

/** ABOUT_PAGE_QUERY: the /about page + the first pillars, as one response. */
export function mockAboutPage(pillarsFirst = 3) {
  return { page: about.data.page, ...mockPillars(pillarsFirst) };
}

/** PROJECTS_QUERY / PROJECT_BY_SLUG_QUERY source. */
export const mockProjects = projects.data;

/** REPORTS_QUERY / REPORT_BY_SLUG_QUERY source. */
export const mockReports = reports.data;

/** PAGE_BY_URI_QUERY: pages keyed by URI, e.g. "/work". */
export function mockPage(uri: string) {
  const byUri: Record<string, unknown> = pages.data.pages;
  return { page: byUri[uri] ?? null };
}

/** SITE_SETTINGS_QUERY */
export const mockSiteSettings = siteSettings.data;
