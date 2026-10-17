"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SocialIcons } from "./SocialIcons";
import type { SiteSettings } from "@/lib/cms/types";

type MobileNavProps = Pick<SiteSettings, "labels" | "navigation" | "social">;

/**
 * Below `lg`, the nav collapses behind a toggle. Hover menus don't work on
 * touch, so each item's dropdown links are listed flat underneath it.
 */
export function MobileNav({ labels, navigation, social }: MobileNavProps) {
  const pathname = usePathname();
  const [openOn, setOpenOn] = useState<string | null>(null);
  // Tied to the path it was opened on, so navigating closes it.
  const open = openOn === pathname;
  const close = () => setOpenOn(null);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpenOn(open ? null : pathname)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-ink"
      >
        {open ? labels.menuClose : labels.menuOpen}
      </button>

      <div
        id="mobile-nav"
        hidden={!open}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-slate-200 bg-paper"
      >
        <nav aria-label="Main (mobile)" className="px-6 py-6">
          <ul className="divide-y divide-slate-100">
            {navigation.map((item, i) => {
              const children = [...item.categories, ...item.quickLinks];
              return (
                <li key={i} className="py-3">
                  <Link
                    href={item.href}
                    onClick={close}
                    className="text-base font-semibold tracking-[0.08em] text-ink uppercase"
                  >
                    {item.label}
                  </Link>
                  {children.length > 0 ? (
                    <ul className="mt-2 space-y-1.5 pl-4">
                      {children.map((link, j) => (
                        <li key={j}>
                          <Link
                            href={link.href}
                            onClick={close}
                            className="text-[0.9375rem] text-muted hover:text-blue-600"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <SocialIcons items={social} className="mt-6" />
        </nav>
      </div>
    </div>
  );
}
