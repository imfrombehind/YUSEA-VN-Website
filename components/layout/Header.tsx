"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { Logo } from "./Logo";
import { SocialIcons } from "./SocialIcons";
import type { SiteSettings } from "@/lib/cms/types";

type HeaderProps = Pick<SiteSettings, "navigation" | "social">;

/**
 * Utilitarian, color-blocked header bar (spec §4/§5).
 *
 * The forward-slash separators between nav items come from the project spec.
 * Worth noting they are *not* a pattern on shiftcities.org, which uses a
 * conventional menu — so this is a YUSEA-specific departure, not a copy.
 *
 * The slashes are decorative: they are rendered as aria-hidden spans so
 * screen readers announce a clean list of links.
 */
export function Header({ navigation, social }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-navy">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-5 lg:px-10">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-3">
            {navigation.map((item, i) => (
              <Fragment key={item.href}>
                {i > 0 ? (
                  <li aria-hidden="true" className="text-white/35 select-none">
                    /
                  </li>
                ) : null}
                <li>
                  <Link
                    href={item.href}
                    className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white transition-colors hover:text-sun"
                  >
                    {item.label}
                  </Link>
                </li>
              </Fragment>
            ))}
          </ul>
        </nav>

        <div className="hidden lg:block">
          <SocialIcons items={social} />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white lg:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-white/15 bg-navy lg:hidden"
      >
        <nav aria-label="Main (mobile)" className="px-6 py-6">
          <ul className="flex flex-col gap-4">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-lg font-bold uppercase tracking-[0.1em] text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <SocialIcons items={social} className="mt-8" />
        </nav>
      </div>
    </header>
  );
}
