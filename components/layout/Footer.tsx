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
 * Dark footer, WEF-style: columns of links (About's sections; Projects and
 * publications with All projects and All publications), then the logo,
 * copyright, address and social icons, centred. The columns are built in
 * the root layout from the About and /work pages.
 */
export function Footer({ siteName, logo, footer, social, columns }: FooterProps) {
  const shown = columns.filter((column) => column.heading.label || column.links.length > 0);

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-20">
        {shown.length > 0 ? (
          <nav aria-label={siteName}>
            <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {shown.map((column, i) => (
                <li key={i}>
                  {column.heading.label ? (
                    <h2 className="text-xl tracking-[-0.02em] text-white">
                      {column.heading.href ? (
                        <Link href={column.heading.href} className="underline-offset-4 hover:underline">
                          {column.heading.label}
                        </Link>
                      ) : (
                        column.heading.label
                      )}
                    </h2>
                  ) : null}
                  <ul className={`space-y-3 ${column.heading.label ? "mt-5" : ""}`}>
                    {column.links
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
              ))}
            </ul>
          </nav>
        ) : null}

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
