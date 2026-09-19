import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import type { Homepage } from "@/lib/cms/types";

/**
 * #homepage-hero — full-bleed photo with the color-blocked header bar
 * sitting directly above it (spec §5).
 *
 * Until an ACF hero image exists, this degrades to a navy color-block with a
 * geometric coral accent rather than a broken image.
 */
export function Hero({ hero }: { hero: Homepage["hero"] }) {
  const hasImage = Boolean(hero.background.url);

  return (
    <section
      id="homepage-hero"
      className="relative isolate overflow-hidden bg-navy"
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
          {/* Keeps headline contrast above AA regardless of the photo. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-navy/70 mix-blend-multiply"
          />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(115deg,var(--color-navy-950)_0%,var(--color-navy)_55%,var(--color-navy-600)_100%)]"
        />
      )}

      {/* Geometric accent — the sharp diagonal transition from spec §4. */}
      <div
        aria-hidden="true"
        className="absolute -right-24 top-0 hidden h-full w-[38%] bg-coral/90 [clip-path:polygon(28%_0,100%_0,100%_100%,0%_100%)] lg:block"
      />

      <div className="relative mx-auto flex min-h-[clamp(520px,72vh,760px)] max-w-[1400px] flex-col justify-center px-6 py-24 lg:px-10">
        <div className="max-w-3xl">
          <h1 className="text-[clamp(2.5rem,6.5vw,5rem)] text-white">
            {hero.headline}
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
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
