import Image from "next/image";
import Link from "next/link";
import { pillarHref } from "@/lib/routes";
import type { Pillar } from "@/lib/cms/types";

/** Shown until a focus card has a photo (WP admin → Our Focus). Decorative. */
function PhotoPlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center border border-slate-200 rounded-2xl text-slate-300"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="size-12">
        <rect x="3" y="4.5" width="18" height="15" rx="2" />
        <circle cx="9" cy="10" r="1.75" />
        <path d="m21 16-5-5-8 8.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/**
 * The Our Focus cards: one per pillar, each linking to /work?pillar=<slug>.
 * Used on the homepage and /about. `sizes` describes the image width at
 * three columns, which differs between the full-width homepage grid and
 * the narrower About column.
 */
export function PillarCards({
  pillars,
  sizes = "(max-width: 768px) 100vw, 33vw",
  tone = "bold",
  className = "",
}: {
  pillars: Pillar[];
  sizes?: string;
  /** "light": the homepage's thin grotesque titles. */
  tone?: "bold" | "light";
  className?: string;
}) {
  return (
    <ul className={`grid gap-12 md:grid-cols-3 md:gap-8 ${className}`}>
      {pillars.map((pillar) => (
        <li key={pillar.slug} className="group relative flex flex-col">
          <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-slate-100">
            {pillar.image ? (
              <Image
                src={pillar.image.url}
                alt={pillar.image.alt}
                fill
                sizes={sizes}
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            ) : (
              <PhotoPlaceholder />
            )}
          </div>

          <div className="flex flex-1 flex-col pt-6">
            <h3
              className={
                tone === "light"
                  ? "font-display text-2xl font-normal tracking-tight text-ink lg:text-[1.75rem]"
                  : "text-xl font-bold text-ink lg:text-2xl"
              }
            >
              {/* The name links to /work?pillar=<slug>; its hit area stretches
                  over the whole card, photo included. */}
              <Link
                href={pillarHref(pillar.slug)}
                className="after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4"
              >
                {pillar.name}
              </Link>
            </h3>
            {pillar.description ? (
              <p className="mt-3 leading-relaxed text-muted">{pillar.description}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
