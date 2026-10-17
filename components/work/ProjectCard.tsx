import Image from "next/image";
import Link from "next/link";
import { projectHref } from "@/lib/routes";
import type { Project, SiteSettings } from "@/lib/cms/types";

/** Image, status + location, title, excerpt. Used on /work and /work/projects. */
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
      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-slate-100">
        {project.heroImage ? (
          <Image
            src={project.heroImage.url}
            alt={project.heroImage.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <p className="text-sm text-muted">
          {[statusLabels[project.status], location].filter(Boolean).join(" · ")}
        </p>
        <h3 className="mt-2 text-xl font-bold text-ink">
          {/* The title link's hit area stretches over the whole card. */}
          <Link
            href={projectHref(project.slug)}
            className="after:absolute after:inset-0 group-hover:text-blue-600"
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
