import Link from "next/link";
import { pillarHref } from "@/lib/routes";
import type { Term } from "@/lib/cms/types";

/** The pillars on a single project or publication, each linking to its /work filter. */
export function PillarTags({ pillars, className = "" }: { pillars: Term[]; className?: string }) {
  if (pillars.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {pillars.map((pillar) => (
        <li key={pillar.slug}>
          <Link
            href={pillarHref(pillar.slug)}
            className="inline-block rounded-full border border-slate-300 px-4 py-1.5 font-display text-base tracking-tight text-ink transition-colors hover:border-ink"
          >
            {pillar.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
