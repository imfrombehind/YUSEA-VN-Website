import { ArrowLink } from "@/components/ui/ArrowLink";
import { PillarCards } from "@/components/work/PillarCards";
import type { Homepage } from "@/lib/cms/types";

/**
 * "Our focus" tab of How we drive impact: the three core pillars. The
 * eyebrow isn't shown; it's the tab label's fallback.
 *
 * Section copy comes from ACF; the cards are the `pillar` taxonomy terms, so
 * each "Explore more" link carries the term slug into /work?pillar=<slug>,
 * which filters projects and publications to that pillar.
 */
export function FocusPanel({ data }: { data: Homepage["ourFocus"] }) {
  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <h3 className="font-grotesk text-3xl leading-tight font-normal tracking-[-0.025em] text-ink md:text-[2.75rem]">
          {data.heading}
        </h3>
        <ArrowLink href={data.cta.href} className="shrink-0 text-ink">
          {data.cta.label}
        </ArrowLink>
      </div>

      <PillarCards
        pillars={data.pillars}
        linkLabel={data.linkLabel}
        tone="light"
        className="mt-12 lg:mt-14 lg:gap-10"
      />
    </>
  );
}
