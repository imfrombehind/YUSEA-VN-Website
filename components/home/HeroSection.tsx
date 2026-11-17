import { ArrowLink } from "@/components/ui/ArrowLink";
import { HeroSlideshow, type HeroSlide } from "./HeroSlideshow";
import type { CTA, Homepage } from "@/lib/cms/types";

/**
 * #homepage-hero — a split: the headline on a solid sun-yellow panel at
 * left (2/5), a slideshow at right (3/5, wide enough for 3:2 covers). The slides are the active projects (photo,
 * status, location, link); with none, the ACF hero photos stand in,
 * uncaptioned.
 *
 * The CTA (ACF hero.cta, "Find out more" → /about) and, under it, the
 * annual report PDF (Site Settings) are quiet text links at the foot of the
 * panel. Sun is too light for white, so the panel's text is
 * ink, which passes AA on it.
 */
export function HeroSection({
  hero,
  projectSlides,
  annualReport,
}: {
  hero: Homepage["hero"];
  projectSlides: HeroSlide[];
  /** Site Settings: the annual report PDF, under the CTA. */
  annualReport: CTA;
}) {
  const slides: HeroSlide[] =
    projectSlides.length > 0 ? projectSlides : hero.slides.map((image) => ({ image }));

  return (
    <section id="homepage-hero" className="grid bg-sun lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="flex flex-col justify-between gap-14 px-6 py-14 text-ink sm:py-16 lg:gap-10 lg:px-10 lg:pt-12 lg:pb-14">
        <div>
          <h1 className="max-w-[15ch] font-display text-[clamp(2.75rem,5vw,5.25rem)] lg:text-[clamp(2.25rem,3.3vw,4.25rem)] leading-[1.04] font-normal tracking-[-0.035em]">
            {hero.headline}
          </h1>
          {hero.subheadline ? (
            <p className="mt-8 max-w-xl lg:mt-6 font-display text-xl leading-snug font-light tracking-tight sm:text-2xl lg:text-lg 2xl:text-xl">
              {hero.subheadline}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col items-start gap-4">
          <ArrowLink href={hero.cta.href}>{hero.cta.label}</ArrowLink>
          {annualReport.label && annualReport.href ? (
            <ArrowLink href={annualReport.href} target="_blank" rel="noopener noreferrer">
              {annualReport.label}
            </ArrowLink>
          ) : null}
        </div>
      </div>

      {/* 3:2 like the covers; the row grows to fit it, and if the headline
          panel runs taller the photo stretches to match. */}
      <div className="relative isolate aspect-[3/2] w-full overflow-hidden bg-ink lg:self-stretch">
        {slides.length > 0 ? (
          <HeroSlideshow slides={slides} sizes="(max-width: 1024px) 100vw, 60vw" />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(115deg,#101114_0%,var(--color-ink)_55%,var(--color-muted)_100%)]"
          />
        )}
      </div>
    </section>
  );
}
