import Image from "next/image";
import Link from "next/link";
import { MetaLine } from "@/components/ui/MetaLine";
import { projectHref } from "@/lib/routes";
import type { Project, SiteSettings } from "@/lib/cms/types";

/**
 * Photo, status (ink) and location, title, excerpt — the Spotlight card
 * style. Used on /work and /work/projects.
 */
export function ProjectCard({
  project,
  statusLabels,
}: {
  project: Project;
  statusLabels: SiteSettings["work"]["status"];
}) {
  const location = [project.city, project.province]
    .filter((part, i, all) => part && all.indexOf(part) === i)
    .join(", ");

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[3/2] overflow-hidden bg-slate-100">
        {project.heroImage ? (
          <Image
            src={project.heroImage.url}
            alt={project.heroImage.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <MetaLine
          className="font-display text-base tracking-tight text-muted"
          items={[
            statusLabels[project.status] ? (
              <span className="text-ink">{statusLabels[project.status]}</span>
            ) : null,
            location,
          ]}
        />
        <h3 className="mt-1 text-xl leading-snug tracking-[-0.02em] text-ink lg:text-2xl">
          {/* The title link's hit area stretches over the whole card. */}
          <Link
            href={projectHref(project.slug)}
            className="after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4"
          >
            {project.title}
          </Link>
        </h3>
        {project.excerpt ? (
          <p className="mt-3 leading-relaxed text-muted">{project.excerpt}</p>
        ) : null}
      </div>
    </article>
  );
}
