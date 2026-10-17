import Link from "next/link";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { SocialIcons } from "./SocialIcons";
import type { CTA, NavItem, SiteSettings } from "@/lib/cms/types";

type HeaderProps = Pick<
  SiteSettings,
  "siteName" | "logo" | "labels" | "navigation" | "social"
>;

/**
 * Sticky white bar with a hairline bottom rule: wordmark left, nav centre,
 * social icons right.
 *
 * Dropdowns are pure CSS (`group` / `group-hover`), with no React state, so
 * the header stays a Server Component. `group-focus-within` opens the same
 * panel for keyboard users tabbing through the links. Only the mobile menu
 * needs client JS; it lives in MobileNav.
 */
export function Header({
  siteName,
  logo,
  labels,
  navigation,
  social,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-paper">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-4 lg:px-10">
        <Logo siteName={siteName} logo={logo} />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navigation.map((item, i) => (
              <NavEntry key={i} item={item} />
            ))}
          </ul>
        </nav>

        <div className="hidden lg:block">
          <SocialIcons items={social} />
        </div>

        <MobileNav labels={labels} navigation={navigation} social={social} />
      </div>
    </header>
  );
}

const LINK =
  "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold tracking-[0.08em] text-slate-700 uppercase transition-colors hover:bg-slate-50 hover:text-ink";

function NavEntry({ item }: { item: NavItem }) {
  const hasDropdown = item.categories.length > 0 || item.quickLinks.length > 0;

  if (!hasDropdown) {
    return (
      <li>
        <Link href={item.href} className={LINK}>
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li className="group relative">
      <Link href={item.href} className={LINK}>
        {item.label}
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z"
          />
        </svg>
      </Link>

      {/* pt-3 bridges the gap under the trigger, so the pointer can travel
          into the panel without the hover dropping. */}
      <div className="invisible absolute top-full left-1/2 -translate-x-1/2 translate-y-1 pt-3 opacity-0 transition duration-150 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <div className="flex w-max max-w-[min(36rem,calc(100vw-3rem))] gap-10 rounded-2xl border border-slate-200 bg-paper p-6 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18)]">
          <DropdownColumn heading={item.categoriesHeading} links={item.categories} />
          <DropdownColumn heading={item.quickLinksHeading} links={item.quickLinks} />
        </div>
      </div>
    </li>
  );
}

function DropdownColumn({ heading, links }: { heading: string; links: CTA[] }) {
  if (links.length === 0) return null;

  return (
    <div className="min-w-44">
      {heading ? (
        <p className="mb-3 text-xs font-semibold tracking-[0.12em] text-muted uppercase">
          {heading}
        </p>
      ) : null}
      <ul className="space-y-1">
        {links.map((link, i) => (
          <li key={i}>
            <Link
              href={link.href}
              className="-mx-3 block rounded-lg px-3 py-1.5 text-[0.9375rem] text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
