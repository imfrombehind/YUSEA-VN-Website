import { ContextPanel } from "./ContextPanel";
import { FocusPanel } from "./FocusPanel";
import { ImpactTabs, type ImpactTab } from "./ImpactTabs";
import type { Homepage } from "@/lib/cms/types";

/**
 * #homepage-impact — "How we drive impact": a heading over two tabs, The
 * context (statsBand) and Our focus (ourFocus, the three pillars). A tab
 * with nothing to show is left out; with one left, there is no tab list.
 */
export function ImpactSection({ homepage }: { homepage: Homepage }) {
  const { impactTabs, statsBand, ourFocus } = homepage;
  const tabs: ImpactTab[] = [];
  if (statsBand.heading || statsBand.stats.length > 0) {
    tabs.push({ label: impactTabs.contextLabel, panel: <ContextPanel data={statsBand} /> });
  }
  if (ourFocus.pillars.length > 0) {
    tabs.push({ label: impactTabs.focusLabel, panel: <FocusPanel data={ourFocus} /> });
  }
  if (tabs.length === 0) return null;

  return (
    <section id="homepage-impact" className="bg-white py-section lg:py-section-lg">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        {impactTabs.heading ? (
          <h2
            id="homepage-impact-heading"
            className="mb-8 font-grotesk text-5xl font-normal tracking-[-0.035em] text-ink lg:text-7xl"
          >
            {impactTabs.heading}
          </h2>
        ) : null}

        {tabs.length > 1 ? (
          <ImpactTabs
            tabs={tabs}
            labelledBy={impactTabs.heading ? "homepage-impact-heading" : undefined}
          />
        ) : (
          tabs[0].panel
        )}
      </div>
    </section>
  );
}
