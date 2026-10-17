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
            className="inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
          >
            {pillar.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
