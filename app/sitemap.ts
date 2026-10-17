import type { MetadataRoute } from "next";
import { getPosts, getProjects, getReports } from "@/lib/cms";
import { projectHref, publicationHref } from "@/lib/routes";
import { siteUrl } from "@/lib/seo";

/** Same ISR window as the pages it lists. */
export const revalidate = 3600;

/**
 * Every route that exists. Filtered views (?pillar=, ?type=) are left out:
 * they are subsets of the indexes listed here.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  // WPGraphQL caps a page at 100 nodes; paginate once the lists outgrow that.
  const [posts, reports, projects] = await Promise.all([
    getPosts(100),
    getReports(100),
    getProjects(),
  ]);
  const newest = [...posts, ...reports]
    .map((p) => p.date)
    .sort()
    .at(-1);

  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly" },
    { url: `${base}/work`, changeFrequency: "weekly" },
    { url: `${base}/work/projects`, changeFrequency: "weekly" },
    {
      url: `${base}/work/publications`,
      lastModified: newest ? new Date(newest) : undefined,
      changeFrequency: "weekly",
    },
    ...projects.map((project) => ({ url: `${base}${projectHref(project.slug)}` })),
    ...[...reports, ...posts].map((publication) => ({
      url: `${base}${publicationHref(publication)}`,
      lastModified: publication.date ? new Date(publication.date) : undefined,
    })),
  ];
}
