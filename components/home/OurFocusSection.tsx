import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PillarCards } from "@/components/work/PillarCards";
import type { Homepage } from "@/lib/cms/types";

/**
 * #homepage-focus — the three core pillars on a light slate ground.
 *
 * Section copy comes from ACF; the cards are the `pillar` taxonomy terms, so
 * each "Explore more" link carries the term slug into /work?pillar=<slug>,
 * which filters projects and publications to that pillar.
 */
export function OurFocusSection({ data }: { data: Homepage["ourFocus"] }) {
  if (data.pillars.length === 0) return null;

  return (
    <section id="homepage-focus" className="bg-slate-50 py-section lg:py-section-lg">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {data.eyebrow ? (
              <Eyebrow accent="blue" className="mb-4">
                {data.eyebrow}
              </Eyebrow>
            ) : null}
            <h2 className="text-3xl font-extrabold text-ink md:text-4xl">{data.heading}</h2>
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
      </div>
    </section>
  );
}
