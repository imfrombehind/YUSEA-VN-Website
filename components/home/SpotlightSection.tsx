import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import { projectHref, publicationHref } from "@/lib/routes";
import type { Homepage, Media, SiteSettings, SpotlightItem } from "@/lib/cms/types";

type Entry = {
  key: string;
  label: string;
  date: string;
  title: string;
  excerpt: string;
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
    excerpt: item.excerpt,
    href: isProject ? projectHref(item.slug) : publicationHref(item),
    image: isProject ? item.heroImage : item.image,
  };
}

/** "Project · 5 October 2026", with the label in the accent colour. */
function Meta({ entry }: { entry: Entry }) {
  return (
    <p className="text-sm text-muted">
      {entry.label ? <span className="font-semibold text-blue-700">{entry.label}</span> : null}
      {entry.label && entry.date ? " · " : null}
      {entry.date ? <time dateTime={entry.date}>{formatDate(entry.date)}</time> : null}
    </p>
  );
}

function Thumb({ image, sizes, className }: { image?: Media; sizes: string; className: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-100 ${className}`}>
      {image ? (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : null}
    </div>
  );
}

/**
 * #homepage-spotlight — the newest projects and publications together: the
 * latest one large at left, the next few as a list at right.
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
  const [featured, ...rest] = items.map((item) =>
    toEntry(item, data.projectLabel, kindLabels),
  );

  return (
    <section
      id="homepage-spotlight"
      className="border-t border-slate-200 bg-white py-section lg:py-section-lg"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          {data.heading ? (
            <h2 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl lg:text-6xl">
              {data.heading}
            </h2>
          ) : (
            <span />
          )}
          <div className="shrink-0">
            <ButtonLink href={data.cta.href} variant="outline">
              {data.cta.label}
            </ButtonLink>
          </div>
        </div>

        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-14">
          <article className="group relative lg:col-span-7">
            <Thumb
              image={featured.image}
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="aspect-[16/10]"
            />
            <div className="pt-6">
              <Meta entry={featured} />
              <h3 className="mt-3 text-2xl font-bold text-ink md:text-3xl">
                {/* The title link's hit area stretches over the whole card. */}
                <Link
                  href={featured.href}
                  className="after:absolute after:inset-0 group-hover:text-blue-600"
                >
                  {featured.title}
                </Link>
              </h3>
              {featured.excerpt ? (
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
                  {featured.excerpt}
                </p>
              ) : null}
            </div>
          </article>

          {rest.length > 0 ? (
            <ul className="divide-y divide-slate-200 border-y border-slate-200 lg:col-span-5 lg:self-start">
              {rest.map((entry) => (
                <li key={entry.key}>
                  <article className="group relative flex gap-5 py-6">
                    <Thumb
                      image={entry.image}
                      sizes="160px"
                      className="aspect-[4/3] w-28 shrink-0 sm:w-36"
                    />
                    <div className="min-w-0">
                      <Meta entry={entry} />
                      <h3 className="mt-2 text-lg leading-snug font-bold text-ink">
                        <Link
                          href={entry.href}
                          className="after:absolute after:inset-0 group-hover:text-blue-600"
                        >
                          {entry.title}
                        </Link>
                      </h3>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
