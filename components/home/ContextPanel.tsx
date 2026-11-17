import type { Homepage } from "@/lib/cms/types";

/**
 * "The context" tab of How we drive impact: the heading as a large ink
 * line, the body in grey beneath it, then a three-up row of stats divided
 * by hairlines. The eyebrow isn't shown; it's the tab label's fallback.
 *
 * `intro` is the ACF WYSIWYG field, so it arrives as HTML (paragraphs and
 * bullet lists). It's from our own CMS, so it's rendered as trusted HTML,
 * like post bodies; Tailwind Typography (`prose`) styles it.
 */
export function ContextPanel({ data }: { data: Homepage["statsBand"] }) {
  return (
    <>
      <div className="max-w-4xl">
        <h3 className="font-display text-3xl leading-tight font-normal tracking-[-0.025em] text-ink md:text-[2.75rem]">
          {data.heading}
        </h3>
        {data.intro ? (
          <div
            className="prose prose-xl prose-yusea mt-6 max-w-none"
            dangerouslySetInnerHTML={{ __html: data.intro }}
          />
        ) : null}
      </div>

      {data.stats.length > 0 ? (
        <dl className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10 lg:mt-20">
          {data.stats.map((stat) => (
            <div key={stat.description} className="border-t border-slate-300 pt-6">
              {/* A <dl> group may hold only <dt>/<dd>, so the figure is the
                  <dt> and the label and source are <dd>s. */}
              <dt className="font-display text-6xl leading-none font-light tracking-[-0.04em] text-ink lg:text-7xl">
                {stat.value}
              </dt>
              <dd className="mt-5 font-display text-xl leading-snug font-light tracking-tight text-muted">
                {stat.description}
              </dd>
              {stat.source ? (
                <dd className="mt-3 text-sm text-muted">{stat.source}</dd>
              ) : null}
            </div>
          ))}
        </dl>
      ) : null}
    </>
  );
}
