import Link from "next/link";
import { HeroSlideshow, type HeroSlide } from "./HeroSlideshow";
import type { Homepage } from "@/lib/cms/types";

/**
 * #homepage-hero — a split: the headline on a solid blue panel at left, a
 * slideshow at right. The slides are the active projects (photo, status,
 * location, link); with none, the ACF hero photos stand in, uncaptioned.
 *
 * The CTA (ACF hero.cta, "Find out more" → /about) is a quiet text link at
 * the foot of the panel. White on `blue` passes AA at every size used here.
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
    <section id="homepage-hero" className="grid bg-blue lg:grid-cols-2">
      <div className="flex flex-col justify-between gap-12 px-6 py-14 sm:py-16 lg:min-h-[clamp(560px,78vh,760px)] lg:px-10 lg:py-16">
        <div>
          <h1 className="max-w-2xl text-[clamp(2.5rem,4.6vw,4.5rem)] leading-[1.05] font-semibold tracking-tight text-white">
            {hero.headline}
          </h1>
          {hero.subheadline ? (
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white sm:text-xl">
              {hero.subheadline}
            </p>
          ) : null}
        </div>

        {hero.cta.label ? (
          <Link
            href={hero.cta.href}
            className="group inline-flex w-fit items-center gap-3 font-display text-lg text-white hover:underline sm:text-xl"
          >
            {hero.cta.label}
            <span
              aria-hidden="true"
              className="text-2xl leading-none transition-transform group-hover:translate-x-1"
            >
              &rsaquo;
            </span>
          </Link>
        ) : null}
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
