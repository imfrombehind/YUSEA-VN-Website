import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PillarCards } from "@/components/work/PillarCards";
import type { Homepage } from "@/lib/cms/types";

/**
 * "Our focus" tab of How we drive impact: the three core pillars.
 *
 * Section copy comes from ACF; the cards are the `pillar` taxonomy terms, so
 * each "Explore more" link carries the term slug into /work?pillar=<slug>,
 * which filters projects and publications to that pillar.
 */
export function FocusPanel({ data }: { data: Homepage["ourFocus"] }) {
  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {data.eyebrow ? (
            <Eyebrow accent="blue" className="mb-4">
              {data.eyebrow}
            </Eyebrow>
          ) : null}
          <h3 className="text-3xl font-extrabold text-ink md:text-4xl">{data.heading}</h3>
        </div>
        <div className="shrink-0">
          <ButtonLink href={data.cta.href} variant="outline">
            {data.cta.label}
          </ButtonLink>
        </div>
      </div>

      <PillarCards
        pillars={data.pillars}
        linkLabel={data.linkLabel}
        className="mt-12 lg:mt-16 lg:gap-10"
      />
    </>
  );
}
