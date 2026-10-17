import Link from "next/link";
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
          <Logo siteName={siteName} logo={logo} size="lg" />

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-2">
              {footerLinks.map((item, i) => (
                <li key={i}>
                  <Link
                    href={item.href}
                    className="text-[0.9375rem] font-medium text-slate-700 transition-colors hover:text-blue-600"
                  >
                    {item.label}
                  </Link>
                </li>
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
