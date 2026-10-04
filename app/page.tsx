import { Hero } from "@/components/home/Hero";
import { StatsBand } from "@/components/home/StatsBand";
import { MissionGrid } from "@/components/home/MissionGrid";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { LatestPosts } from "@/components/home/LatestPosts";
import { Partners } from "@/components/home/Partners";
import { getHomepage, getSiteSettings } from "@/lib/cms";

/** ISR per spec §3. On-demand purges arrive via /api/revalidate. */
export const revalidate = 3600;

/**
 * Every string and image here comes from WordPress: `getHomepage()` is one
 * query for the page's ACF fields plus the latest posts; partner logos come
 * from the options page (already fetched by the layout, so this is cached).
 */
export default async function HomePage() {
  const [homepage, settings] = await Promise.all([
    getHomepage(3),
    getSiteSettings(),
  ]);

  return (
    <>
      <Hero hero={homepage.hero} />
      <StatsBand statsBand={homepage.statsBand} />
      <MissionGrid missionGrid={homepage.missionGrid} />
      <ProjectsSection projects={homepage.projects} />
      <LatestPosts latestPosts={homepage.latestPosts} />
      <Partners partners={homepage.partners} logos={settings.partners} />
    </>
  );
}
