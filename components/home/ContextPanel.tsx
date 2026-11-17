import { Eyebrow } from "@/components/ui/Eyebrow";
import type { Homepage } from "@/lib/cms/types";

/**
 * "The context" tab of How we drive impact: an asymmetric 5/7 split
 * (headline / body) over a three-up row of stats divided by thin left rules.
 *
 * `intro` is the ACF WYSIWYG field, so it arrives as HTML (paragraphs and
 * bullet lists). It's from our own CMS, so it's rendered as trusted HTML,
 * like post bodies; Tailwind Typography (`prose`) styles it.
 */
export function ContextPanel({ data }: { data: Homepage["statsBand"] }) {
  return (
    <>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          {data.eyebrow ? (
            <Eyebrow accent="blue" className="mb-5">
              {data.eyebrow}
            </Eyebrow>
          ) : null}
          <h3 className="text-3xl leading-[1.1] font-extrabold tracking-tight text-ink md:text-4xl">
            {data.heading}
          </h3>
        </div>

        {data.intro ? (
          <div
            className="prose prose-lg prose-yusea max-w-none lg:col-span-7"
            dangerouslySetInnerHTML={{ __html: data.intro }}
          />
        ) : null}
      </div>

      {data.stats.length > 0 ? (
        <dl className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10 lg:mt-20">
          {data.stats.map((stat) => (
            <div key={stat.description} className="border-l-2 border-slate-300 pl-6">
              {/* A <dl> group may hold only <dt>/<dd>, so the figure is the
                  <dt> and the label and source are <dd>s. */}
              <dt className="font-display text-6xl leading-none font-extrabold tracking-tight text-ink lg:text-7xl">
                {stat.value}
              </dt>
              <dd className="mt-5 text-lg leading-snug text-muted">{stat.description}</dd>
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
