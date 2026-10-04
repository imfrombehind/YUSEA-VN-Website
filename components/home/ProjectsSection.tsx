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
    // Wordless skeleton: dynamic() loaders can't receive CMS props.
    loading: () => (
      <div aria-hidden="true" className="min-h-[420px] animate-pulse bg-tint-blue lg:min-h-[620px]" />
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
            eyebrow={projects.eyebrow}
            title={projects.heading}
            body={projects.body}
            accent="sun"
          />
          <div className="shrink-0">
            <ButtonLink href={projects.cta.href} variant="coral">
              {projects.cta.label}
            </ButtonLink>
          </div>
        </div>

        <div className="mt-14 border border-line">
          <VietnamMap labels={projects.map} />
        </div>
      </div>
    </section>
  );
}
