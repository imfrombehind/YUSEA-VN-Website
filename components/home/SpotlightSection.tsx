import Image from "next/image";
import Link from "next/link";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { formatDate } from "@/lib/format";
import { projectHref, publicationHref } from "@/lib/routes";
import type { Homepage, Media, SiteSettings, SpotlightItem } from "@/lib/cms/types";

type Entry = {
  key: string;
  label: string;
  date: string;
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
    date: item.date,
    title: item.title,
    href: isProject ? projectHref(item.slug) : publicationHref(item),
    image: isProject ? item.heroImage : item.image,
  };
}

/**
 * Photo, a grey "Project · 5 October 2026" line, then the title. The title
 * link's hit area stretches over the whole card.
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
      <p className="mt-4 font-display text-base tracking-tight text-muted">
        {entry.label}
        {entry.label && entry.date ? " · " : null}
        {entry.date ? <time dateTime={entry.date}>{formatDate(entry.date)}</time> : null}
      </p>
      <h3
        className={`mt-1 font-display leading-snug font-normal tracking-[-0.02em] text-ink ${
          large ? "text-2xl lg:text-[1.75rem]" : "text-xl lg:text-2xl"
        }`}
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
 * #homepage-spotlight — the newest projects and publications together: the
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
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {data.heading ? (
              <h2 className="font-display text-5xl font-normal tracking-[-0.035em] text-ink lg:text-7xl">
                {data.heading}
              </h2>
            ) : null}
            {data.intro ? (
              <p className="mt-4 max-w-3xl font-display text-2xl leading-snug font-light tracking-tight text-muted lg:text-[2rem]">
                {data.intro}
              </p>
            ) : null}
          </div>
          <ArrowLink href={data.cta.href} className="shrink-0 text-ink sm:mt-4">
            {data.cta.label}
          </ArrowLink>
        </div>

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
