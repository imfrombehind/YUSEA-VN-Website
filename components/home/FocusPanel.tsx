import { ArrowLink } from "@/components/ui/ArrowLink";
import { LeadIntro } from "./LeadIntro";
import { PillarCards } from "@/components/work/PillarCards";
import type { Homepage } from "@/lib/cms/types";

/**
 * "Our focus" tab of How we drive impact: a lead sentence in ink, the intro
 * in grey beneath it, the CTA link, then the three core pillars. The
 * heading and eyebrow aren't shown; they're the tab label's fallbacks.
 *
 * Section copy comes from ACF; the cards are the `pillar` taxonomy terms, so
 * each card links with the term slug into /work?pillar=<slug>,
 * which filters projects and publications to that pillar.
 */
export function FocusPanel({ data }: { data: Homepage["ourFocus"] }) {
  return (
    <>
      <LeadIntro lead={data.lead} intro={data.intro} />

      <ArrowLink href={data.cta.href} className="mt-8 text-ink">
        {data.cta.label}
      </ArrowLink>

      <PillarCards
        pillars={data.pillars}
        className="mt-12 lg:mt-16 lg:gap-10"
      />
    </>
  );
}
