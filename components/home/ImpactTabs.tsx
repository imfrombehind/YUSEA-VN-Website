"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type ImpactTab = { label: string; panel: ReactNode };

/**
 * A pill segmented control over its panels (WAI-ARIA tabs, automatic
 * activation: arrow keys, Home and End move and select). The panels are
 * rendered on the server and passed in; hidden ones stay in the HTML.
 */
export function ImpactTabs({
  tabs,
  labelledBy,
}: {
  tabs: ImpactTab[];
  /** id of the section heading that names the tab list. */
  labelledBy?: string;
}) {
  const id = useId();
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function select(i: number) {
    const next = (i + tabs.length) % tabs.length;
    setActive(next);
    buttons.current[next]?.focus();
  }

  function onKeyDown(event: KeyboardEvent) {
    const moves: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      select(moves[event.key]);
    }
  }

  return (
    <>
      <div
        role="tablist"
        aria-labelledby={labelledBy}
        onKeyDown={onKeyDown}
        className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-slate-100 p-2"
      >
        {tabs.map((tab, i) => (
          <button
            key={i}
            ref={(el) => {
              buttons.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={`shrink-0 rounded-full px-5 py-2.5 font-display text-lg tracking-tight whitespace-nowrap transition-colors sm:px-6 sm:text-2xl ${
              i === active ? "bg-ink text-white" : "text-ink hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== active}
          className="mt-12 motion-safe:animate-fade-in lg:mt-14"
        >
          {tab.panel}
        </div>
      ))}
    </>
  );
}
