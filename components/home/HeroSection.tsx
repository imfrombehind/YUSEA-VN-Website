import { ArrowLink } from "@/components/ui/ArrowLink";
import { HeroSlideshow, type HeroSlide } from "./HeroSlideshow";
import type { Homepage } from "@/lib/cms/types";

/**
 * #homepage-hero — a split: the headline on a solid sun-yellow panel at
 * left, a slideshow at right. The slides are the active projects (photo,
 * status, location, link); with none, the ACF hero photos stand in,
 * uncaptioned.
 *
 * The CTA (ACF hero.cta, "Find out more" → /about) is a quiet text link at
 * the foot of the panel. Sun is too light for white, so the panel's text is
 * ink, which passes AA on it.
 */
export function HeroSection({
  hero,
  projectSlides,
}: {
  hero: Homepage["hero"];
  projectSlides: HeroSlide[];
}) {
  const slides: HeroSlide[] =
    projectSlides.length > 0 ? projectSlides : hero.slides.map((image) => ({ image }));

  return (
    <section id="homepage-hero" className="grid bg-sun lg:grid-cols-2">
      <div className="flex flex-col justify-between gap-14 px-6 py-14 text-ink sm:py-16 lg:min-h-[clamp(560px,80vh,780px)] lg:px-10 lg:pt-16 lg:pb-14">
        <div>
          <h1 className="max-w-[15ch] font-grotesk text-[clamp(2.75rem,5vw,5.25rem)] leading-[1.04] font-normal tracking-[-0.035em]">
            {hero.headline}
          </h1>
          {hero.subheadline ? (
            <p className="mt-8 max-w-xl font-grotesk text-xl leading-snug font-light tracking-tight sm:text-2xl">
              {hero.subheadline}
            </p>
          ) : null}
        </div>

        <ArrowLink href={hero.cta.href} className="w-fit">
          {hero.cta.label}
        </ArrowLink>
      </div>

      <div className="relative isolate aspect-[4/3] overflow-hidden bg-ink lg:aspect-auto">
        {slides.length > 0 ? (
          <HeroSlideshow slides={slides} sizes="(max-width: 1024px) 100vw, 50vw" />
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
