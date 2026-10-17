import { FilterChips } from "@/components/work/FilterChips";
import { ProjectCard } from "@/components/work/ProjectCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getIndexPage, getPillars, getProjects, getSiteSettings } from "@/lib/cms";
import { byPillar, firstParam, pillarHref } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

type Props = {
  searchParams: Promise<{ pillar?: string | string[] }>;
};

export async function generateMetadata() {
  const copy = await getIndexPage("/work/projects");
  return pageMetadata({
    title: copy.heading,
    description: copy.intro,
    path: "/work/projects",
  });
}

/** Every project, optionally narrowed with ?pillar=<slug> (the header dropdown links). */
export default async function ProjectsPage({ searchParams }: Props) {
  const [copy, { work }, pillars, projects] = await Promise.all([
    getIndexPage("/work/projects"),
    getSiteSettings(),
    getPillars(),
    getProjects(),
  ]);

  const requested = firstParam((await searchParams).pillar);
  const pillar = pillars.find((p) => p.slug === requested)?.slug;
  const shown = byPillar(projects, pillar);

  return (
    <div className="bg-paper py-section lg:py-section-lg">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading
          as="h1"
          eyebrow={copy.eyebrow}
          title={copy.heading}
          body={copy.intro || undefined}
          accent="blue"
        />

        <FilterChips
          label={work.filterLabel}
          className="mt-10"
          chips={[
            { label: work.filterAll, href: "/work/projects", active: !pillar },
            ...pillars.map((p) => ({
              label: p.name,
              href: pillarHref(p.slug, "/work/projects"),
              active: p.slug === pillar,
            })),
          ]}
        />

        {shown.length === 0 ? (
          <p className="mt-14 text-muted">{work.emptyText}</p>
        ) : (
          <ul className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((project) => (
              <li key={project.id}>
                <ProjectCard project={project} statusLabels={work.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
