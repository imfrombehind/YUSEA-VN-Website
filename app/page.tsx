import { HeroSection } from "@/components/home/HeroSection";
import { ImpactSection } from "@/components/home/ImpactSection";
import { OurFocusSection } from "@/components/home/OurFocusSection";
import { getHomepage } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

/** ISR per spec §3. On-demand purges arrive via /api/revalidate. */
export const revalidate = 3600;

/** CMS default title and description, plus the canonical and share tags. */
export function generateMetadata() {
  return pageMetadata({ path: "/" });
}

/**
 * Every string and image here comes from WordPress: `getHomepage()` is one
 * query for the page's ACF fields plus the Our Focus pillars.
 */
export default async function HomePage() {
  const homepage = await getHomepage();

  return (
    <>
      <HeroSection hero={homepage.hero} />
      <ImpactSection data={homepage.statsBand} />
      <OurFocusSection data={homepage.ourFocus} />
    </>
  );
}
