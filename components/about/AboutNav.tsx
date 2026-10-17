"use client";

import { useEffect, useState } from "react";

export type AboutNavItem = { id: string; label: string };

/**
 * The /about side nav: in-page links to each section, with an arrow on the
 * one being read. Without JavaScript it is still a working list of anchors.
 */
export function AboutNav({ label, items }: { label: string; items: AboutNavItem[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    // A section counts as "being read" once its top passes the upper third
    // of the viewport; the last one to do so wins. At the very bottom of
    // the page the last section wins, even if it is too short to get there.
    let frame = 0;
    const update = () => {
      frame = 0;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      const line = window.innerHeight / 3;
      let current = sections[0]?.id;
      for (const el of sections) {
        if (atBottom || el.getBoundingClientRect().top <= line) current = el.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  return (
    <nav aria-label={label}>
      <ul className="space-y-4">
        {items.map((item) => {
          const current = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={current ? "location" : undefined}
                className={`flex items-baseline gap-2 text-lg leading-snug transition-colors ${
                  current ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {current ? <span aria-hidden="true">&rarr;</span> : null}
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
