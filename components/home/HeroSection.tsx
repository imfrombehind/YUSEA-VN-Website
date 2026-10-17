import { ButtonLink } from "@/components/ui/Button";
import { HeroSlideshow } from "./HeroSlideshow";
import type { Homepage } from "@/lib/cms/types";

/**
 * #homepage-hero — full-bleed photos spanning the whole viewport width, with
 * the white header bar sitting directly above. Several photos crossfade
 * (HeroSlideshow); one photo just sits there.
 *
 * Until an ACF hero image exists, this degrades to a dark gradient ground
 * rather than a broken image.
 */
export function HeroSection({ hero }: { hero: Homepage["hero"] }) {
  const hasImage = hero.slides.length > 0;

  return (
    <section
      id="homepage-hero"
      className="relative isolate overflow-hidden bg-ink"
    >
      {hasImage ? (
        <>
          <HeroSlideshow slides={hero.slides} />
          {/* Keeps headline contrast above AA regardless of the photo:
              heaviest behind the left-aligned copy, lighter to the right so
              the city stays visible. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(90deg,rgb(0_0_0/0.72)_0%,rgb(0_0_0/0.5)_45%,rgb(0_0_0/0.2)_100%)]"
          />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(115deg,#101114_0%,var(--color-ink)_55%,var(--color-muted)_100%)]"
        />
      )}

      <div className="relative mx-auto flex min-h-[clamp(520px,72vh,760px)] max-w-[1400px] flex-col justify-center px-6 py-24 lg:px-10">
        <div className="max-w-3xl">
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] tracking-tight text-white">
            {hero.headline}
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl">
            {hero.subheadline}
          </p>

          <div className="mt-10">
            <ButtonLink href={hero.cta.href} variant="sun" className="px-7 py-3.5 text-base">
              {hero.cta.label}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
