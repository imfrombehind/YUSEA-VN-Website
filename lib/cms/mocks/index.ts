/**
 * Mock WPGraphQL responses, one per query in lib/cms/queries.ts.
 *
 * Each export is shaped exactly like `{ data }` from the real endpoint, so it
 * runs through the same mappers as live content. Edit the JSON files to
 * change what the site shows while WORDPRESS_USE_MOCKS is "true".
 */

import homepage from "./homepage.json";
import posts from "./posts.json";
import projects from "./projects.json";
import siteSettings from "./site-settings.json";

/** POSTS_QUERY / POST_BY_SLUG_QUERY source. */
export const mockPosts = posts.data;

/** HOMEPAGE_QUERY: page ACF fields + the newest posts, as one response. */
export function mockHomepage(postsFirst = 3) {
  return {
    pageData: homepage.data.pageData,
    posts: { nodes: posts.data.posts.nodes.slice(0, postsFirst) },
  };
}

/** PROJECTS_QUERY */
export const mockProjects = projects.data;

/** SITE_SETTINGS_QUERY */
export const mockSiteSettings = siteSettings.data;
