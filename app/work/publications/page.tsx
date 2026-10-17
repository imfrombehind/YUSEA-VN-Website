import { FilterChips } from "@/components/work/FilterChips";
import { PublicationCard } from "@/components/work/PublicationCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPillars, getPublications, getSiteSettings } from "@/lib/cms";
import type { Publication } from "@/lib/cms/types";
import { byPillar, firstParam, withQuery } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

type Props = {
  searchParams: Promise<{
    pillar?: string | string[];
    type?: string | string[];
  }>;
};

const KINDS: Publication["kind"][] = ["report", "blog"];

export async function generateMetadata() {
  const { work } = await getSiteSettings();
  return pageMetadata({
    title: work.publications.heading,
    description: work.publications.intro,
    path: "/work/publications",
  });
}

/**
 * Reports and blog posts together, newest first. Two independent filters:
 * ?type=report|blog and ?pillar=<slug>. Each chip row keeps the other's value.
 */
export default async function PublicationsPage({ searchParams }: Props) {
  const [{ work }, pillars, publications] = await Promise.all([
    getSiteSettings(),
    getPillars(),
    getPublications(),
  ]);

  const params = await searchParams;
  const requestedType = firstParam(params.type);
  const type = KINDS.find((k) => k === requestedType);
  const requestedPillar = firstParam(params.pillar);
  const pillar = pillars.find((p) => p.slug === requestedPillar)?.slug;

  const shown = byPillar(publications, pillar).filter((p) => !type || p.kind === type);
  const href = (q: { type?: string; pillar?: string }) =>
    withQuery("/work/publications", { type, pillar, ...q });

  return (
    <div className="bg-paper py-section lg:py-section-lg">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading
          as="h1"
          eyebrow={work.publications.eyebrow}
          title={work.publications.heading}
          body={work.publications.intro || undefined}
          accent="blue"
        />

        <div className="mt-10 space-y-3">
          <FilterChips
            label={work.publicationsHeading}
            chips={[
              { label: work.filterAll, href: href({ type: undefined }), active: !type },
              ...KINDS.map((k) => ({
                label: work.kind[k],
                href: href({ type: k }),
                active: k === type,
              })),
            ]}
          />
          <FilterChips
            label={work.filterLabel}
            chips={[
              { label: work.filterAll, href: href({ pillar: undefined }), active: !pillar },
              ...pillars.map((p) => ({
                label: p.name,
                href: href({ pillar: p.slug }),
                active: p.slug === pillar,
              })),
            ]}
          />
        </div>

        {shown.length === 0 ? (
          <p className="mt-14 text-muted">{work.emptyText}</p>
        ) : (
          <ul className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((publication) => (
              <li key={`${publication.kind}-${publication.id}`}>
                <PublicationCard publication={publication} kindLabels={work.kind} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
