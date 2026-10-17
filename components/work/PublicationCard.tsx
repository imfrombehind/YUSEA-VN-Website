import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { publicationHref } from "@/lib/routes";
import type { Publication, SiteSettings } from "@/lib/cms/types";

/** Image, kind + date, title, excerpt. Reports and blog posts share it. */
export function PublicationCard({
  publication,
  kindLabels,
}: {
  publication: Publication;
  kindLabels: SiteSettings["work"]["kind"];
}) {
  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-slate-100">
        {publication.image ? (
          <Image
            src={publication.image.url}
            alt={publication.image.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <p className="text-sm text-muted">
          {kindLabels[publication.kind] ? (
            <span className="font-semibold text-blue-700">
              {kindLabels[publication.kind]}
            </span>
          ) : null}
          {kindLabels[publication.kind] ? " · " : null}
          <time dateTime={publication.date}>{formatDate(publication.date)}</time>
        </p>
        <h3 className="mt-2 text-xl font-bold text-ink">
          {/* The title link's hit area stretches over the whole card. */}
          <Link
            href={publicationHref(publication)}
            className="after:absolute after:inset-0 group-hover:text-blue-600"
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
