import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Homepage } from "@/lib/cms/types";

/**
 * #homepage-section-1 — stark multi-column data grid (spec §5).
 *
 * The stat/description split mirrors the reference site's own stats block,
 * where the figure and its completing clause are separate fields. That
 * separation is what lets the figure be set at display scale without the
 * sentence breaking apart.
 */
export function StatsBand({ statsBand }: { statsBand: Homepage["statsBand"] }) {
  return (
    <section id="homepage-section-1" className="bg-sky py-section lg:py-section-lg">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading
          eyebrow="The context"
          title={statsBand.heading}
          body={statsBand.intro}
        />

        <dl className="mt-16 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {statsBand.stats.map((stat) => (
            <div key={stat.description} className="bg-paper p-8 lg:p-10">
              <dt className="font-display text-[clamp(2.75rem,5vw,4.25rem)] font-bold leading-[0.95] tracking-tight text-navy">
                {stat.value}
              </dt>
              <dd className="mt-4 text-lg leading-snug text-muted">
                {stat.description}
              </dd>
              {stat.source ? (
                <p className="mt-5 text-xs uppercase tracking-[0.12em] text-faint">
                  {stat.source}
                </p>
              ) : null}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
