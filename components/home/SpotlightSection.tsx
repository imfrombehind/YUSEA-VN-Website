import Image from "next/image";
import Link from "next/link";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { formatDate } from "@/lib/format";
import { projectHref, publicationHref } from "@/lib/routes";
import { LeadIntro } from "./LeadIntro";
import type { Homepage, Media, SiteSettings, SpotlightItem } from "@/lib/cms/types";

type Entry = {
  key: string;
  label: string;
  /** Pillar names, e.g. ["Urban mobility", "Climate resilience"]. */
  pillars: string[];
  /** A project's timeframe, else the ISO publish date. */
  period: { text: string } | { date: string };
  title: string;
  href: string;
  image?: Media;
};

function toEntry(
  item: SpotlightItem,
  projectLabel: string,
  kindLabels: SiteSettings["work"]["kind"],
): Entry {
  const isProject = item.kind === "project";
  return {
    key: `${item.kind}:${item.id}`,
    label: isProject ? projectLabel : kindLabels[item.kind],
    pillars: item.pillars.map((p) => p.name),
    period: isProject && item.timeframe ? { text: item.timeframe } : { date: item.date },
    title: item.title,
    href: isProject ? projectHref(item.slug) : publicationHref(item),
    image: isProject ? item.heroImage : item.image,
  };
}

/**
 * Photo, a meta line (type in ink; pillars and period in grey, spaced
 * apart rather than dotted), then the title. The title link's hit area
 * stretches over the whole card.
 */
function Card({ entry, large }: { entry: Entry; large: boolean }) {
  return (
    <article className="group relative">
      <div
        className={`relative overflow-hidden bg-slate-100 ${large ? "aspect-[3/2]" : "aspect-[16/10]"}`}
      >
        {entry.image ? (
          <Image
            src={entry.image.url}
            alt={entry.image.alt}
            fill
            sizes={large ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        ) : null}
      </div>
      <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-display text-base tracking-tight text-muted">
        {entry.label ? <span className="text-ink">{entry.label}</span> : null}
        {entry.pillars.length > 0 ? <span>{entry.pillars.join(", ")}</span> : null}
        {"text" in entry.period ? (
          <span>{entry.period.text}</span>
        ) : entry.period.date ? (
          <time dateTime={entry.period.date}>{formatDate(entry.period.date)}</time>
        ) : null}
      </p>
      <h3
        // The lead entry is a full h3; the rest a step smaller.
        className={`mt-1 text-ink ${large ? "" : "text-h4"}`}
      >
        <Link
          href={entry.href}
          className="after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4"
        >
          {entry.title}
        </Link>
      </h3>
    </article>
  );
}

/**
 * #homepage-spotlight — the newest projects and publications together,
 * under the same heading, lead/intro and link as How we drive impact: the
 * two latest side by side and large, the next three in a row beneath.
 */
export function SpotlightSection({
  data,
  items,
  kindLabels,
}: {
  data: Homepage["spotlight"];
  items: SpotlightItem[];
  kindLabels: SiteSettings["work"]["kind"];
}) {
  if (items.length === 0) return null;
  const entries = items.map((item) => toEntry(item, data.projectLabel, kindLabels));
  const top = entries.slice(0, 2);
  const rest = entries.slice(2);

  return (
    <section id="homepage-spotlight" className="bg-white pb-section lg:pb-section-lg">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        {data.heading ? (
          <h2 className="mb-8 text-ink">
            {data.heading}
          </h2>
        ) : null}

        <LeadIntro lead={data.lead} intro={data.intro} />

        <ArrowLink href={data.cta.href} className="mt-8 text-ink">
          {data.cta.label}
        </ArrowLink>

        <div className="mt-12 grid gap-x-4 gap-y-12 md:grid-cols-2 lg:mt-16">
          {top.map((entry) => (
            <Card key={entry.key} entry={entry} large />
          ))}
        </div>

        {rest.length > 0 ? (
          <div className="mt-12 grid gap-x-4 gap-y-12 md:grid-cols-3 lg:mt-14">
            {rest.map((entry) => (
              <Card key={entry.key} entry={entry} large={false} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
