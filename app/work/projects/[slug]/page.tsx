import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PillarTags } from "@/components/work/PillarTags";
import { Prose } from "@/components/work/Prose";
import { getProjectBySlug, getProjects, getSiteSettings } from "@/lib/cms";
import { projectHref } from "@/lib/routes";
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

/** Single project: title, location, hero image, body, and its impact metrics. */
export default async function ProjectPage({ params }: Props) {
  const [project, { work }] = await Promise.all([
    getProjectBySlug((await params).slug),
    getSiteSettings(),
  ]);
  if (!project) notFound();

  const location = [project.city, project.province]
    .filter((part, i, all) => part && all.indexOf(part) === i)
    .join(", ");

  return (
    <article className="bg-paper py-section lg:py-section-lg">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <header className="max-w-4xl">
          <p className="text-sm font-medium text-muted">
            {[work.status[project.status], location].filter(Boolean).join(" · ")}
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight break-words text-ink md:text-5xl lg:text-6xl">
            {project.title}
          </h1>
          {project.excerpt ? (
            <p className="mt-6 text-xl leading-relaxed text-muted">{project.excerpt}</p>
          ) : null}
          <PillarTags pillars={project.pillars} className="mt-8" />
        </header>

        {project.heroImage ? (
          <div className="relative mt-12 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100 lg:mt-16">
            <Image
              src={project.heroImage.url}
              alt={project.heroImage.alt}
              fill
              preload
              sizes="(max-width: 1400px) 100vw, 1400px"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-16">
          <Prose html={project.content} className="lg:col-span-8" />

          {project.metrics.length > 0 ? (
            <aside className="lg:col-span-4">
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
    </article>
  );
}
