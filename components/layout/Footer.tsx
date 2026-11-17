import Link from "next/link";
import { Logo } from "./Logo";
import { SocialIcons } from "./SocialIcons";
import type { CTA, SiteSettings } from "@/lib/cms/types";

type FooterProps = Pick<
  SiteSettings,
  "siteName" | "logo" | "footer" | "navigation" | "footerLinks" | "social"
> & {
  /** The /about sections with content, as /about#id links. */
  aboutLinks: CTA[];
};

/** A column's links, without repeats (a dropdown may list a link twice). */
function unique(links: CTA[]): CTA[] {
  return links.filter((link, i) => links.findIndex((l) => l.href === link.href) === i);
}

/**
 * Dark footer: a column per header nav item, then the footer links as a
 * "Quick links" column; below them the logo, copyright, address and social
 * icons, centred.
 *
 * The About column lists the About page's sections; the others list their
 * dropdown's quick links and categories (all projects, each focus, by
 * type). A nav item with neither links to itself.
 */
export function Footer({
  siteName,
  logo,
  footer,
  navigation,
  footerLinks,
  social,
  aboutLinks,
}: FooterProps) {
  const columns: { heading: string; links: CTA[]; fallback: CTA }[] = navigation.map((item) => ({
    heading: item.label,
    links:
      item.href === "/about" && aboutLinks.length > 0
        ? aboutLinks
        : unique([...item.quickLinks, ...item.categories]),
    fallback: { label: item.label, href: item.href },
  }));
  if (footerLinks.length > 0) {
    columns.push({
      heading: footer.linksHeading,
      links: footerLinks,
      fallback: { label: "", href: "" },
    });
  }

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-20">
        <nav aria-label={siteName}>
          <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((column, i) => {
              const links = column.links.length > 0 ? column.links : [column.fallback];
              return (
                <li key={i}>
                  {column.heading ? (
                    <h2 className="text-xl tracking-[-0.02em] text-white">{column.heading}</h2>
                  ) : null}
                  <ul className={`space-y-3 ${column.heading ? "mt-5" : ""}`}>
                    {links
                      .filter((link) => link.label)
                      .map((link, j) => (
                        <li key={j}>
                          <Link
                            href={link.href}
                            className="font-display tracking-tight text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-16 flex flex-col items-center gap-6 text-center lg:mt-24">
          <Logo siteName={siteName} logo={logo} size="lg" tone="light" />
          <div className="space-y-1 font-display tracking-tight text-white/75">
            {/* ACF copyright may contain {year}, kept current on each rebuild. */}
            <p>{footer.copyright.replace("{year}", String(new Date().getFullYear()))}</p>
            {/* ACF textarea: line breaks entered in WP admin are kept. */}
            {footer.address ? <p className="whitespace-pre-line">{footer.address}</p> : null}
          </div>
          <SocialIcons items={social} tone="light" className="mt-4 gap-6" />
        </div>
      </div>
    </footer>
  );
}
