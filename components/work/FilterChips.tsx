import Link from "next/link";

export type FilterChip = {
  label: string;
  href: string;
  active: boolean;
};

/**
 * A pill switch of links that set a query param (?pillar=, ?type=), styled
 * like the homepage tabs. Plain links, not buttons: each filter is a
 * shareable URL rendered on the server.
 */
export function FilterChips({
  label,
  chips,
  className = "",
}: {
  /** aria-label for the group, e.g. "Filter by focus". */
  label: string;
  chips: FilterChip[];
  className?: string;
}) {
  return (
    <nav aria-label={label} className={`max-w-full ${className}`}>
      <ul className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-slate-100 p-1.5">
        {chips.map((chip) => (
          <li key={chip.href} className="shrink-0">
            <Link
              href={chip.href}
              scroll={false}
              aria-current={chip.active ? "page" : undefined}
              className={`inline-block rounded-full px-4 py-2 font-display text-base tracking-tight whitespace-nowrap transition-colors sm:px-5 sm:text-lg ${
                chip.active ? "bg-ink text-white" : "text-ink hover:bg-slate-200"
              }`}
            >
              {chip.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
