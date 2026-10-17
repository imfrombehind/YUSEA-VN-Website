/**
 * The content facade.
 *
 * Components import from here and nowhere else. Every getter runs one
 * WPGraphQL query — or, while mocks are on, reads the matching mock response
 * from lib/cms/mocks — and passes the result through the same mapper. There
 * is no copy in components; all text and images come through here.
 *
 * To go live: set WORDPRESS_GRAPHQL_ENDPOINT and WORDPRESS_USE_MOCKS="false"
 * in .env.local (and in Vercel). That is the whole switch — no code edits.
 */

import { wpQuery } from "./client";
import {
  mapHomepage,
  mapPageDetail,
  mapPillars,
  mapPostDetail,
  mapPosts,
  mapProjectDetail,
  mapProjects,
  mapReportDetail,
  mapReports,
  mapSiteSettings,
} from "./mappers";
import {
  mockHomepage,
  mockPage,
  mockPillars,
  mockPosts,
  mockProjects,
  mockReports,
  mockSiteSettings,
} from "./mocks";
import {
  HOMEPAGE_QUERY,
  PAGE_BY_URI_QUERY,
  PILLARS_QUERY,
  POST_BY_SLUG_QUERY,
  POSTS_QUERY,
  PROJECT_BY_SLUG_QUERY,
  PROJECTS_QUERY,
  REPORT_BY_SLUG_QUERY,
  REPORTS_QUERY,
  SITE_SETTINGS_QUERY,
} from "./queries";
import type {
  Homepage,
  PageDetail,
  Pillar,
  Post,
  PostDetail,
  Project,
  ProjectDetail,
  Publication,
  Report,
  ReportDetail,
  SiteSettings,
} from "./types";

/**
 * True once WordPress is wired up. WORDPRESS_USE_MOCKS lets the endpoint sit
 * in .env.local before the server exists; anything but "false" means mocks.
 */
export function isCmsConnected(): boolean {
  return (
    Boolean(process.env.WORDPRESS_GRAPHQL_ENDPOINT) &&
    process.env.WORDPRESS_USE_MOCKS === "false"
  );
}

type CmsRequest<T> = {
  label: string;
  query: string;
  variables?: Record<string, unknown>;
  tags: string[];
  /** The raw `data` WPGraphQL would return for this query. */
  mock: unknown;
  map: (data: unknown) => T;
};

/**
 * The toggle. Mocks on → map the mock response. Mocks off → fetch live and
 * map that.
 *
 * Once live there is deliberately no fallback to mocks: a failed fetch throws,
 * which fails the render. Under ISR that means Next keeps serving the last
 * good version of the page; at build time it fails the deploy, so Vercel
 * keeps the previous one. Mock copy can never be cached as real content.
 */
async function cmsRequest<T>({
  label,
  query,
  variables,
  tags,
  mock,
  map,
}: CmsRequest<T>): Promise<T> {
  if (!isCmsConnected()) return map(mock);

  try {
    return map(await wpQuery(query, { variables, tags }));
  } catch (error) {
    console.error(`[cms] ${label} failed; the last cached page stays live.`);
    throw error;
  }
}

/** Options page: header, footer, metadata, logo, favicon, shared labels. */
export function getSiteSettings(): Promise<SiteSettings> {
  return cmsRequest({
    label: "getSiteSettings",
    query: SITE_SETTINGS_QUERY,
    tags: ["site-settings"],
    mock: mockSiteSettings,
    map: mapSiteSettings,
  });
}

/**
 * Homepage ACF fields + the Our Focus pillars, in one query. Tagged
 * "pillars" too, so editing a pillar term refreshes the homepage.
 */
export function getHomepage(): Promise<Homepage> {
  return cmsRequest({
    label: "getHomepage",
    query: HOMEPAGE_QUERY,
    variables: { pillarsFirst: 3 },
    tags: ["homepage", "pillars"],
    mock: mockHomepage(3),
    map: mapHomepage,
  });
}

/** Every pillar term, for the /work filter row. */
export function getPillars(): Promise<Pillar[]> {
  return cmsRequest({
    label: "getPillars",
    query: PILLARS_QUERY,
    variables: { pillarsFirst: 20 },
    tags: ["pillars"],
    mock: mockPillars(20),
    map: mapPillars,
  });
}

export function getProjects(): Promise<Project[]> {
  return cmsRequest({
    label: "getProjects",
    query: PROJECTS_QUERY,
    tags: ["projects"],
    mock: mockProjects,
    map: mapProjects,
  });
}

/** A single project, or null. Purge one with the "project:<slug>" tag. */
export function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  return cmsRequest({
    label: "getProjectBySlug",
    query: PROJECT_BY_SLUG_QUERY,
    variables: { slug },
    tags: ["projects", `project:${slug}`],
    mock: {
      project: mockProjects.projects.nodes.find((n) => n.slug === slug) ?? null,
    },
    map: mapProjectDetail,
  });
}

/** Blog posts, newest first. Tagged "posts" so a publish in WP purges the list. */
export function getPosts(first = 24): Promise<Post[]> {
  return cmsRequest({
    label: "getPosts",
    query: POSTS_QUERY,
    variables: { first },
    tags: ["posts"],
    mock: { posts: { nodes: mockPosts.posts.nodes.slice(0, first) } },
    map: mapPosts,
  });
}

/**
 * A single post, or null if WP has no post with that slug. Tagged both
 * "posts" (bulk purge) and "post:<slug>" (purge just this one).
 */
export function getPostBySlug(slug: string): Promise<PostDetail | null> {
  return cmsRequest({
    label: "getPostBySlug",
    query: POST_BY_SLUG_QUERY,
    variables: { slug },
    tags: ["posts", `post:${slug}`],
    mock: {
      post: mockPosts.posts.nodes.find((n) => n.slug === slug) ?? null,
    },
    map: mapPostDetail,
  });
}

export function getReports(first = 100): Promise<Report[]> {
  return cmsRequest({
    label: "getReports",
    query: REPORTS_QUERY,
    variables: { first },
    tags: ["reports"],
    mock: { reports: { nodes: mockReports.reports.nodes.slice(0, first) } },
    map: mapReports,
  });
}

/** A single report, or null. Purge one with the "report:<slug>" tag. */
export function getReportBySlug(slug: string): Promise<ReportDetail | null> {
  return cmsRequest({
    label: "getReportBySlug",
    query: REPORT_BY_SLUG_QUERY,
    variables: { slug },
    tags: ["reports", `report:${slug}`],
    mock: {
      report: mockReports.reports.nodes.find((n) => n.slug === slug) ?? null,
    },
    map: mapReportDetail,
  });
}

/** Reports and blog posts together, newest first. */
export async function getPublications(): Promise<Publication[]> {
  const [reports, posts] = await Promise.all([getReports(), getPosts(100)]);
  return [...reports, ...posts].sort((a, b) => b.date.localeCompare(a.date));
}

/** A standard WP page by path, e.g. "/about", or null. */
export function getPageByUri(uri: string): Promise<PageDetail | null> {
  return cmsRequest({
    label: "getPageByUri",
    query: PAGE_BY_URI_QUERY,
    variables: { uri },
    tags: ["pages", `page:${uri}`],
    mock: mockPage(uri),
    map: mapPageDetail,
  });
}

export * from "./types";
