import Link from "next/link";
import { Logo } from "./Logo";
import { SocialIcons } from "./SocialIcons";
import type { CTA, SiteSettings } from "@/lib/cms/types";

/** A footer column: a heading (a link when it has an href) over its links. */
export type FooterColumn = {
  heading: CTA;
  links: CTA[];
};

type FooterProps = Pick<SiteSettings, "siteName" | "logo" | "footer" | "social"> & {
  columns: FooterColumn[];
};

/**
 * Dark footer, WEF-style and compact: columns of links on the left (About's
 * sections; Projects and publications with All projects and All
 * publications), the logo and social icons on the right, then a hairline
 * and the copyright and address in small type. The columns are built in the
 * root layout from the About and /work pages. On phones it all stacks.
 */
export function Footer({ siteName, logo, footer, social, columns }: FooterProps) {
  const shown = columns.filter((column) => column.heading.label || column.links.length > 0);

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10 lg:py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          {shown.length > 0 ? (
            <nav aria-label={siteName}>
              <ul className="grid gap-x-16 gap-y-8 sm:grid-cols-2">
                {shown.map((column, i) => (
                  <li key={i}>
                    {column.heading.label ? (
                      <h2 className="text-h4 text-white">
                        {column.heading.href ? (
                          <Link href={column.heading.href} className="underline-offset-4 hover:underline">
                            {column.heading.label}
                          </Link>
                        ) : (
                          column.heading.label
                        )}
                      </h2>
                    ) : null}
                    <ul className={`space-y-2 ${column.heading.label ? "mt-4" : ""}`}>
                      {column.links
                        .filter((link) => link.label)
                        .map((link, j) => (
                          <li key={j}>
                            <Link
                              href={link.href}
                              // Files and other sites (the annual report PDF) open in a new tab.
                              {...(/^https?:/.test(link.href)
                                ? { target: "_blank", rel: "noopener noreferrer" }
                                : {})}
                              className="font-display tracking-tight text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <div className="flex flex-col items-start gap-6 lg:items-end">
            <Logo siteName={siteName} logo={logo} size="lg" tone="light" />
            <SocialIcons items={social} tone="light" className="gap-6" />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-1 border-t border-white/15 pt-6 font-display text-sm tracking-tight text-white/75 sm:flex-row sm:justify-between sm:gap-6">
          {/* ACF copyright may contain {year}, kept current on each rebuild. */}
          <p>{footer.copyright.replace("{year}", String(new Date().getFullYear()))}</p>
          {/* ACF textarea: line breaks entered in WP admin are kept. */}
          {footer.address ? <p className="whitespace-pre-line sm:text-right">{footer.address}</p> : null}
        </div>
      </div>
    </footer>
  );
}
