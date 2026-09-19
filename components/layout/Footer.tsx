import Link from "next/link";
import { Fragment } from "react";
import { Logo } from "./Logo";
import { SocialIcons } from "./SocialIcons";
import type { SiteSettings } from "@/lib/cms/types";

type FooterProps = Pick<SiteSettings, "footerLinks" | "social">;

/**
 * Color-blocked footer mirroring the header treatment (spec §5).
 */
export function Footer({ footerLinks, social }: FooterProps) {
  return (
    <footer className="bg-navy-950 text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-20">
        <div className="flex flex-col gap-10 border-b border-white/15 pb-10 lg:flex-row lg:items-center lg:justify-between">
          <Logo />

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {footerLinks.map((item, i) => (
                <Fragment key={item.href}>
                  {i > 0 ? (
                    <li aria-hidden="true" className="text-white/30 select-none">
                      /
                    </li>
                  ) : null}
                  <li>
                    <Link
                      href={item.href}
                      className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white/80 transition-colors hover:text-sun"
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

        <div className="flex flex-col gap-3 pt-8 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} YUSEA. All rights reserved.
          </p>
          <p>Ha Noi, Viet Nam</p>
        </div>
      </div>
    </footer>
  );
}
