import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Homepage } from "@/lib/cms/types";

/**
 * #homepage-section-2 — the second data grid, on a navy ground so the page
 * alternates hard between light and dark blocks (spec §4 color-blocking).
 */
export function MissionGrid({
  missionGrid,
}: {
  missionGrid: Homepage["missionGrid"];
}) {
  return (
    <section id="homepage-section-2" className="bg-navy py-section lg:py-section-lg">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading
          eyebrow={missionGrid.eyebrow}
          title={missionGrid.heading}
          body={missionGrid.body}
          tone="light"
        />

        <ul className="mt-16 grid gap-px bg-white/15 sm:grid-cols-2">
          {missionGrid.points.map((point, i) => (
            <li key={point.title} className="bg-navy p-8 lg:p-12">
              <span
                aria-hidden="true"
                className="font-display text-sm font-bold tracking-[0.2em] text-coral"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 text-2xl text-white lg:text-3xl">
                {point.title}
              </h3>
              <p className="mt-4 leading-relaxed text-white/70">{point.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
