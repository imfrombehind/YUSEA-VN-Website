import Link from "next/link";

/**
 * Overview | Programme tabs under the site header on a project with a
 * programme. Plain links between two routes; the current one is
 * underlined in ink.
 */
export function ProjectTabs({
  label,
  tabs,
}: {
  /** aria-label, e.g. the project title. */
  label: string;
  tabs: { label: string; href: string; current: boolean }[];
}) {
  const shown = tabs.filter((tab) => tab.label);
  if (shown.length < 2) return null;

  return (
    <nav aria-label={label} className="border-b border-slate-200 bg-paper">
      <ul className="mx-auto flex max-w-[1400px] gap-8 px-6 lg:px-10">
        {shown.map((tab) => (
          <li key={tab.href}>
            <Link
              href={tab.href}
              aria-current={tab.current ? "page" : undefined}
              className={`-mb-px inline-block border-b-2 py-4 font-display text-lg tracking-tight transition-colors ${
                tab.current
                  ? "border-ink text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
