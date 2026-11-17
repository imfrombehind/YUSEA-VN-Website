import { ArrowLink } from "@/components/ui/ArrowLink";
import { PillarCards } from "@/components/work/PillarCards";
import type { Homepage } from "@/lib/cms/types";

/**
 * "Our focus" tab of How we drive impact: a lead sentence in ink, the intro
 * in grey beneath it, the CTA link, then the three core pillars. The
 * heading and eyebrow aren't shown; they're the tab label's fallbacks.
 *
 * Section copy comes from ACF; the cards are the `pillar` taxonomy terms, so
 * each "Explore more" link carries the term slug into /work?pillar=<slug>,
 * which filters projects and publications to that pillar.
 */
export function FocusPanel({ data }: { data: Homepage["ourFocus"] }) {
  return (
    <>
      {data.lead || data.intro ? (
        <div className="max-w-5xl font-display">
          {data.lead ? (
            <h3 className="text-3xl leading-tight font-normal tracking-[-0.025em] text-ink md:text-[2.5rem]">
              {data.lead}
            </h3>
          ) : null}
          {data.intro ? (
            <p className="mt-2 text-3xl leading-tight font-light tracking-[-0.025em] text-muted md:text-[2.5rem]">
              {data.intro}
            </p>
          ) : null}
        </div>
      ) : null}

      <ArrowLink href={data.cta.href} className="mt-8 text-ink">
        {data.cta.label}
      </ArrowLink>

      <PillarCards
        pillars={data.pillars}
        linkLabel={data.linkLabel}
        tone="light"
        className="mt-12 lg:mt-16 lg:gap-10"
      />
    </>
  );
}
