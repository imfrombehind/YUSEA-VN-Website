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
  mapPostDetail,
  mapPosts,
  mapProjects,
  mapSiteSettings,
} from "./mappers";
import {
  mockHomepage,
  mockPosts,
  mockProjects,
  mockSiteSettings,
} from "./mocks";
import {
  HOMEPAGE_QUERY,
  POST_BY_SLUG_QUERY,
  POSTS_QUERY,
  PROJECTS_QUERY,
  SITE_SETTINGS_QUERY,
} from "./queries";
import type {
  Homepage,
  Post,
  PostDetail,
  Project,
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

/** Options page: header, footer, metadata, logo, favicon, partner logos. */
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
 * Homepage ACF fields + latest posts, in one query. Tagged "posts" too, so
 * publishing a post refreshes the homepage's post list.
 */
export function getHomepage(postsFirst = 3): Promise<Homepage> {
  return cmsRequest({
    label: "getHomepage",
    query: HOMEPAGE_QUERY,
    variables: { postsFirst },
    tags: ["homepage", "posts"],
    mock: mockHomepage(postsFirst),
    map: mapHomepage,
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

export * from "./types";
