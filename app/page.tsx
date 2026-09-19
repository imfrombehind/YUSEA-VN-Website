import { Hero } from "@/components/home/Hero";
import { StatsBand } from "@/components/home/StatsBand";
import { MissionGrid } from "@/components/home/MissionGrid";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { Partners } from "@/components/home/Partners";
import { getHomepage, getSiteSettings } from "@/lib/cms";

/** ISR per spec §3. On-demand purges arrive via /api/revalidate. */
export const revalidate = 3600;

export default async function HomePage() {
  const [homepage, settings] = await Promise.all([
    getHomepage(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Hero hero={homepage.hero} />
      <StatsBand statsBand={homepage.statsBand} />
      <MissionGrid missionGrid={homepage.missionGrid} />
      <ProjectsSection projects={homepage.projects} />
      <Partners partners={homepage.partners} logos={settings.partners} />
    </>
  );
}
