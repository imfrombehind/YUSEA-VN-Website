import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import type { Homepage } from "@/lib/cms/types";

/**
 * #homepage-hero — full-bleed photo spanning the whole viewport width, with
 * the white header bar sitting directly above it (spec §5).
 *
 * Until an ACF hero image exists, this degrades to a dark gradient ground
 * rather than a broken image.
 */
export function Hero({ hero }: { hero: Homepage["hero"] }) {
  const hasImage = Boolean(hero.background.url);

  return (
    <section
      id="homepage-hero"
      className="relative isolate overflow-hidden bg-ink"
    >
      {hasImage ? (
        <>
          <Image
            src={hero.background.url}
            alt={hero.background.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
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
          <h1 className="text-[clamp(2.5rem,6.5vw,5rem)] text-white">
            {hero.headline}
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl">
            {hero.subheadline}
          </p>

          <div className="mt-10">
            <ButtonLink href={hero.cta.href} variant="sun">
              {hero.cta.label}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
