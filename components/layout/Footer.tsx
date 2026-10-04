import Link from "next/link";
import { Fragment } from "react";
import { Logo } from "./Logo";
import { SocialIcons } from "./SocialIcons";
import type { SiteSettings } from "@/lib/cms/types";

type FooterProps = Pick<
  SiteSettings,
  "siteName" | "logo" | "footer" | "footerLinks" | "social"
>;

/**
 * Light footer: gray (black-quadrant) tint, ink text, topped by a thin stripe
 * of the four logo colours.
 */
export function Footer({
  siteName,
  logo,
  footer,
  footerLinks,
  social,
}: FooterProps) {
  return (
    <footer className="border-t border-line bg-tint-gray text-ink">
      <div aria-hidden="true" className="grid h-1 grid-cols-4">
        <span className="bg-ink" />
        <span className="bg-coral" />
        <span className="bg-blue" />
        <span className="bg-sun" />
      </div>
      <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-20">
        <div className="flex flex-col gap-10 border-b border-ink/15 pb-10 lg:flex-row lg:items-center lg:justify-between">
          <Logo siteName={siteName} logo={logo} />

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {footerLinks.map((item, i) => (
                <Fragment key={i}>
                  {i > 0 ? (
                    <li aria-hidden="true" className="text-faint select-none">
                      /
                    </li>
                  ) : null}
                  <li>
                    <Link
                      href={item.href}
                      className="font-display text-sm font-bold uppercase tracking-[0.14em] text-ink decoration-coral decoration-2 underline-offset-4 hover:underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                </Fragment>
              ))}
            </ul>
          </nav>

          <SocialIcons items={social} />
        </div>

        <div className="flex flex-col gap-3 pt-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          {/* ACF copyright may contain {year}, kept current on each rebuild. */}
          <p>
            {footer.copyright.replace(
              "{year}",
              String(new Date().getFullYear()),
            )}
          </p>
          {/* ACF textarea: line breaks entered in WP admin are kept. */}
          {footer.address ? (
            <p className="whitespace-pre-line">{footer.address}</p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
