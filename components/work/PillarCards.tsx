import Image from "next/image";
import Link from "next/link";
import { pillarHref } from "@/lib/routes";
import type { Pillar } from "@/lib/cms/types";

/**
 * The Our Focus cards: one per pillar, each linking to /work?pillar=<slug>.
 * Used on the homepage and /about. `sizes` describes the image width at
 * three columns, which differs between the full-width homepage grid and
 * the narrower About column.
 */
export function PillarCards({
  pillars,
  linkLabel,
  sizes = "(max-width: 768px) 100vw, 33vw",
  className = "",
}: {
  pillars: Pillar[];
  linkLabel: string;
  sizes?: string;
  className?: string;
}) {
  return (
    <ul className={`grid gap-12 md:grid-cols-3 md:gap-8 ${className}`}>
      {pillars.map((pillar) => (
        <li key={pillar.slug} className="flex flex-col">
          <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-slate-200">
            {pillar.image ? (
              <Image
                src={pillar.image.url}
                alt={pillar.image.alt}
                fill
                sizes={sizes}
                className="object-cover"
              />
            ) : null}
          </div>

          <div className="flex flex-1 flex-col pt-6">
            <h3 className="text-xl font-bold text-ink lg:text-2xl">{pillar.name}</h3>
            {pillar.description ? (
              <p className="mt-3 leading-relaxed text-muted">{pillar.description}</p>
            ) : null}
            {linkLabel ? (
              <Link
                href={pillarHref(pillar.slug)}
                className="mt-auto inline-flex items-center gap-1.5 pt-6 font-semibold text-blue-600 hover:text-blue-700"
              >
                {linkLabel}
                <span className="sr-only">: {pillar.name}</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
