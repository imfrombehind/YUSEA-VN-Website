import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/cms";
import { siteUrl } from "@/lib/seo";

/** Same ISR window as the pages it lists. */
export const revalidate = 3600;

/**
 * Only routes that exist. Add /about, /projects etc. here as their pages are
 * built — the nav links to them already, but they 404 today.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  // WPGraphQL caps a page at 100 nodes; paginate once the blog outgrows that.
  const posts = await getPosts(100);
  const newest = posts[0]?.date ? new Date(posts[0].date) : undefined;

  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, lastModified: newest, changeFrequency: "weekly" },
    ...posts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: post.date ? new Date(post.date) : undefined,
    })),
  ];
}
