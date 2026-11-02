import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PartnershipSection } from "@/components/work/PartnershipSection";
import { PillarTags } from "@/components/work/PillarTags";
import { Prose } from "@/components/work/Prose";
import { getProjectBySlug, getProjects, getSiteSettings } from "@/lib/cms";
import { PROJECTS_PATH, projectHref } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

/** /api/revalidate can purge "projects" or just "project:<slug>". */
export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectBySlug((await params).slug);
  if (!project) return {};
  return pageMetadata({
    title: project.title,
    description: project.excerpt,
    path: projectHref(project.slug),
    image: project.heroImage,
  });
}

/**
 * Single project: a full-width cover photo with the title over it, then
 * Overview (the post body, with the impact metrics beside it), then one
 * section per partnership block.
 */
export default async function ProjectPage({ params }: Props) {
  const [project, { work }] = await Promise.all([
    getProjectBySlug((await params).slug),
    getSiteSettings(),
  ]);
  if (!project) notFound();

  const location = [project.city, project.province]
    .filter((part, i, all) => part && all.indexOf(part) === i)
    .join(", ");
  const meta = [work.status[project.status], project.timeframe, location].filter(Boolean);

  return (
    <article>
      <header className="relative isolate flex min-h-[28rem] flex-col overflow-hidden bg-ink lg:min-h-[36rem]">
        {project.heroImage ? (
          <Image
            src={project.heroImage.url}
            alt={project.heroImage.alt}
            fill
            preload
            sizes="100vw"
            className="-z-10 object-cover"
          />
        ) : null}
        {/* Darkens the photo towards the title so white text stays readable. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/10"
        />

        <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-6 pt-8 pb-12 lg:px-10 lg:pt-12 lg:pb-16">
          <Link
            href={PROJECTS_PATH}
            aria-label={work.backToProjects || undefined}
            className="flex size-12 items-center justify-center rounded-full bg-white/85 text-ink transition-colors hover:bg-white"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>

          <div className="mt-auto max-w-4xl pt-24">
            <h1 className="text-4xl font-extrabold tracking-tight break-words text-white md:text-5xl lg:text-6xl">
              {project.title}
            </h1>
            {meta.length > 0 ? (
              <p className="mt-6 text-lg font-medium text-white/90">{meta.join(" · ")}</p>
            ) : null}
          </div>
        </div>
      </header>

      <section aria-labelledby={work.overviewHeading ? "overview" : undefined} className="bg-paper-soft py-section lg:py-section-lg">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-8">
              {work.overviewHeading ? (
                <h2 id="overview" className="text-4xl text-ink sm:text-5xl">
                  {work.overviewHeading}
                </h2>
              ) : null}
              <Prose html={project.content} className={work.overviewHeading ? "mt-8" : ""} />
              <PillarTags pillars={project.pillars} className="mt-10" />
            </div>

            {project.metrics.length > 0 ? (
              <aside className="lg:col-span-4 lg:pt-4">
                {work.metricsHeading ? (
                  <h2 className="text-sm font-semibold tracking-[0.12em] text-muted uppercase">
                    {work.metricsHeading}
                  </h2>
                ) : null}
                <dl className="mt-6 space-y-10">
                  {project.metrics.map((metric) => (
                    <div key={metric.description} className="border-l-2 border-slate-300 pl-6">
                      <dt className="font-display text-5xl leading-none font-extrabold tracking-tight text-ink">
                        {metric.value}
                      </dt>
                      <dd className="mt-3 text-lg leading-snug text-muted">{metric.description}</dd>
                      {metric.source ? (
                        <dd className="mt-2 text-sm text-muted">{metric.source}</dd>
                      ) : null}
                    </div>
                  ))}
                </dl>
              </aside>
            ) : null}
          </div>
        </div>
      </section>

      {project.partnerships.map((partnership, i) => (
        <PartnershipSection
          key={i}
          partnership={partnership}
          className={i > 0 ? "border-t border-slate-200" : ""}
        />
      ))}
    </article>
  );
}
