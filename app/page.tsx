import { HeroSection } from "@/components/home/HeroSection";
import type { HeroSlide } from "@/components/home/HeroSlideshow";
import { ImpactSection } from "@/components/home/ImpactSection";
import { SpotlightSection } from "@/components/home/SpotlightSection";
import { getHomepage, getProjects, getSiteSettings, getSpotlight } from "@/lib/cms";
import { projectHref } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

/** ISR per spec §3. On-demand purges arrive via /api/revalidate. */
export const revalidate = 3600;

/** CMS default title and description, plus the canonical and share tags. */
export function generateMetadata() {
  return pageMetadata({ path: "/" });
}

/**
 * Every string and image here comes from WordPress: the homepage's ACF
 * fields and pillars, the active projects (hero slideshow), and the newest
 * projects and publications (Spotlight).
 */
export default async function HomePage() {
  const [homepage, projects, spotlight, settings] = await Promise.all([
    getHomepage(),
    getProjects(),
    getSpotlight(5),
    getSiteSettings(),
  ]);

  const statusLabels = settings.work.status;
  const projectSlides: HeroSlide[] = projects
    .filter((p) => p.status === "active" && p.heroImage)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((p) => ({
      image: p.heroImage!,
      title: p.title,
      meta: [statusLabels.active, p.city || p.province],
      href: projectHref(p.slug),
    }));

  return (
    <>
      <HeroSection
        hero={homepage.hero}
        projectSlides={projectSlides}
        annualReport={settings.annualReport}
      />
      <ImpactSection homepage={homepage} />
      <SpotlightSection
        data={homepage.spotlight}
        items={spotlight}
        kindLabels={settings.work.kind}
      />
    </>
  );
}
