import dynamic from "next/dynamic";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Homepage } from "@/lib/cms/types";

/**
 * #homepage-section-3 — Projects copy + CTA, with the interactive Viet Nam
 * map as the focal point (spec §5).
 *
 * MapLibre touches `window` on construction, so the map is client-only.
 */
const VietnamMap = dynamic(
  () => import("./VietnamMap").then((m) => m.VietnamMap),
  {
    loading: () => (
      <div className="flex min-h-[420px] items-center justify-center bg-sky lg:min-h-[620px]">
        <p className="eyebrow text-faint">Loading map…</p>
      </div>
    ),
  },
);

export function ProjectsSection({
  projects,
}: {
  projects: Homepage["projects"];
}) {
  return (
    <section id="homepage-section-3" className="bg-paper py-section lg:py-section-lg">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Where we work"
            title={projects.heading}
            body={projects.body}
          />
          <div className="shrink-0">
            <ButtonLink href={projects.cta.href} variant="coral">
              {projects.cta.label}
            </ButtonLink>
          </div>
        </div>

        <div className="mt-14 border border-line">
          <VietnamMap />
        </div>
      </div>
    </section>
  );
}
