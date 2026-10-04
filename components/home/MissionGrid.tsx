import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Homepage } from "@/lib/cms/types";

/**
 * #homepage-section-2 — the second data grid, on the warm (orange-quadrant)
 * tint, with coral picking out the numbers and card rules.
 */
export function MissionGrid({
  missionGrid,
}: {
  missionGrid: Homepage["missionGrid"];
}) {
  return (
    <section id="homepage-section-2" className="bg-tint-warm py-section lg:py-section-lg">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading
          eyebrow={missionGrid.eyebrow}
          title={missionGrid.heading}
          body={missionGrid.body}
          accent="coral"
        />

        <ul className="mt-16 grid gap-6 sm:grid-cols-2">
          {missionGrid.points.map((point, i) => (
            <li key={point.title} className="border-t-[3px] border-coral bg-paper p-8 transition-shadow hover:shadow-[0_8px_24px_rgba(35,36,41,0.08)] lg:p-12">
              <span
                aria-hidden="true"
                className="font-display text-sm font-bold tracking-[0.2em] text-coral-700"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 text-2xl text-ink lg:text-3xl">
                {point.title}
              </h3>
              <p className="mt-4 leading-relaxed text-muted">{point.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
