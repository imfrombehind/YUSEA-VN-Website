import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FilterChips } from "@/components/work/FilterChips";
import { ProgrammeSchedule } from "@/components/work/ProgrammeSchedule";
import { ProjectTabs } from "@/components/work/ProjectTabs";
import { getProjectBySlug, getSiteSettings } from "@/lib/cms";
import { formatDayShort } from "@/lib/format";
import { firstParam, programmeHref, projectHref } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ day?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [project, { work }] = await Promise.all([getProjectBySlug(slug), getSiteSettings()]);
  if (!project?.programme) return {};
  return pageMetadata({
    title: [work.programme, project.title].filter(Boolean).join(" | "),
    description: project.excerpt,
    path: programmeHref(project.slug),
    image: project.heroImage,
  });
}

/**
 * A project's programme, day by day, under the Overview | Programme tabs.
 * `?day=YYYY-MM-DD` shows one day; an unknown day shows them all. Only
 * exists while the project has programme days. Purged with the project
 * ("projects" / "project:<slug>").
 */
export default async function ProgrammePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const [project, { work }] = await Promise.all([getProjectBySlug(slug), getSiteSettings()]);
  if (!project?.programme) notFound();

  const { programme } = project;
  const requested = firstParam((await searchParams).day);
  const day = programme.days.find((d) => d.date === requested)?.date;
  const shown = day ? { ...programme, days: programme.days.filter((d) => d.date === day) } : programme;

  return (
    <>
      <ProjectTabs
        label={project.title}
        tabs={[
          { label: work.overviewHeading, href: projectHref(project.slug), current: false },
          { label: work.programme, href: programmeHref(project.slug), current: true },
        ]}
      />

      <div className="bg-paper py-section lg:py-section-lg">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionHeading as="h1" title={project.title} body={work.programme || undefined} />

          {programme.days.length > 1 ? (
            <FilterChips
              label={work.programme}
              className="mt-10"
              chips={[
                { label: work.filterAll, href: programmeHref(project.slug), active: !day },
                ...programme.days.map((d) => ({
                  label: formatDayShort(d.date),
                  href: programmeHref(project.slug, d.date),
                  active: d.date === day,
                })),
              ]}
            />
          ) : null}

          <div className="mt-14 lg:mt-20">
            <ProgrammeSchedule programme={shown} />
          </div>
        </div>
      </div>
    </>
  );
}
