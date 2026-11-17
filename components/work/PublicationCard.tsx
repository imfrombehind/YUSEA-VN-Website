import Image from "next/image";
import Link from "next/link";
import { MetaLine } from "@/components/ui/MetaLine";
import { formatDate } from "@/lib/format";
import { publicationHref } from "@/lib/routes";
import type { Publication, SiteSettings } from "@/lib/cms/types";

/**
 * Photo, kind (ink) and date, title, excerpt — the Spotlight card style.
 * Reports and blog posts share it.
 */
export function PublicationCard({
  publication,
  kindLabels,
}: {
  publication: Publication;
  kindLabels: SiteSettings["work"]["kind"];
}) {
  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[3/2] overflow-hidden bg-slate-100">
        {publication.image ? (
          <Image
            src={publication.image.url}
            alt={publication.image.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <MetaLine
          className="font-display text-base tracking-tight text-muted"
          items={[
            kindLabels[publication.kind] ? (
              <span className="text-ink">{kindLabels[publication.kind]}</span>
            ) : null,
            <time key="date" dateTime={publication.date}>{formatDate(publication.date)}</time>,
          ]}
        />
        <h3 className="mt-1 text-ink">
          {/* The title link's hit area stretches over the whole card. */}
          <Link
            href={publicationHref(publication)}
            className="after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4"
          >
            {publication.title}
          </Link>
        </h3>
        {publication.excerpt ? (
          <p className="mt-3 leading-relaxed text-muted">{publication.excerpt}</p>
        ) : null}
      </div>
    </article>
  );
}
