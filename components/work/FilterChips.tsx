import Link from "next/link";

export type FilterChip = {
  label: string;
  href: string;
  active: boolean;
};

/**
 * A row of pill links that set a query param (?pillar=, ?type=). Plain links,
 * not buttons: each filter is a shareable URL rendered on the server.
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
    <nav aria-label={label} className={className}>
      <ul className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <li key={chip.href}>
            <Link
              href={chip.href}
              scroll={false}
              aria-current={chip.active ? "page" : undefined}
              className={`inline-block rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                chip.active
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-paper text-slate-700 hover:border-blue-600 hover:text-blue-600"
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
