import Link from "next/link";
import { FilterChips } from "@/components/work/FilterChips";
import { ProjectCard } from "@/components/work/ProjectCard";
import { PublicationCard } from "@/components/work/PublicationCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  getIndexPage,
  getPillars,
  getProjects,
  getPublications,
  getSiteSettings,
} from "@/lib/cms";
import { byPillar, firstParam, pillarHref, withQuery } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

type Props = {
  searchParams: Promise<{ pillar?: string | string[] }>;
};

/** How many of each list the hub previews before "All projects" etc. */
const PREVIEW = 6;

export async function generateMetadata({ searchParams }: Props) {
  const [hub, pillars, params] = await Promise.all([
    getIndexPage("/work"),
    getPillars(),
    searchParams,
  ]);
  const active = pillars.find((p) => p.slug === firstParam(params.pillar));

  return pageMetadata({
    title: active ? `${active.name} | ${hub.heading}` : hub.heading,
    description: active?.description || hub.intro,
    path: active ? pillarHref(active.slug) : "/work",
  });
}

/**
 * The filterable hub for all projects and publications.
 *
 * `?pillar=<slug>` (from the homepage Our Focus cards, or the chips here)
 * narrows both lists to items tagged with that pillar. An unknown slug is
 * ignored rather than showing an empty page. Reading searchParams makes this
 * route dynamic; the WPGraphQL fetches underneath are still cached.
 */
export default async function WorkPage({ searchParams }: Props) {
  const [hub, { work }, pillars, projects, publications, params] = await Promise.all([
    getIndexPage("/work"),
    getSiteSettings(),
    getPillars(),
    getProjects(),
    getPublications(),
    searchParams,
  ]);

  const active = pillars.find((p) => p.slug === firstParam(params.pillar));
  const pillar = active?.slug;

  const shownProjects = byPillar(projects, pillar);
  const shownPublications = byPillar(publications, pillar);

  return (
    <div className="bg-paper py-section lg:py-section-lg">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading
          as="h1"
          eyebrow={active ? hub.heading : hub.eyebrow}
          title={active?.name ?? hub.heading}
          body={(active?.description || hub.intro) || undefined}
          accent="blue"
        />

        <FilterChips
          label={work.filterLabel}
          className="mt-10"
          chips={[
            { label: work.filterAll, href: "/work", active: !pillar },
            ...pillars.map((p) => ({
              label: p.name,
              href: pillarHref(p.slug),
              active: p.slug === pillar,
            })),
          ]}
        />

        <WorkSection
          heading={hub.sections.projectsHeading}
          viewAll={{
            label: hub.sections.viewAllProjects,
            href: withQuery("/work/projects", { pillar }),
          }}
          empty={shownProjects.length === 0 ? work.emptyText : undefined}
        >
          {shownProjects.slice(0, PREVIEW).map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} statusLabels={work.status} />
            </li>
          ))}
        </WorkSection>

        <WorkSection
          heading={hub.sections.publicationsHeading}
          viewAll={{
            label: hub.sections.viewAllPublications,
            href: withQuery("/work/publications", { pillar }),
          }}
          empty={shownPublications.length === 0 ? work.emptyText : undefined}
        >
          {shownPublications.slice(0, PREVIEW).map((publication) => (
            <li key={`${publication.kind}-${publication.id}`}>
              <PublicationCard publication={publication} kindLabels={work.kind} />
            </li>
          ))}
        </WorkSection>
      </div>
    </div>
  );
}

function WorkSection({
  heading,
  viewAll,
  empty,
  children,
}: {
  heading: string;
  viewAll: { label: string; href: string };
  /** Shown in place of the grid when the filter leaves nothing. */
  empty?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16 border-t border-slate-200 pt-12 lg:mt-20">
      <div className="flex items-baseline justify-between gap-6">
        <h2 className="text-2xl font-extrabold text-ink md:text-3xl">{heading}</h2>
        {viewAll.label && !empty ? (
          <Link
            href={viewAll.href}
            className="shrink-0 font-semibold text-blue-600 hover:text-blue-700"
          >
            {viewAll.label} <span aria-hidden="true">&rarr;</span>
          </Link>
        ) : null}
      </div>

      {empty ? (
        <p className="mt-8 text-muted">{empty}</p>
      ) : (
        <ul className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {children}
        </ul>
      )}
    </section>
  );
}
