import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AboutNav, type AboutNavItem } from "@/components/about/AboutNav";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PillarCards } from "@/components/work/PillarCards";
import { Prose } from "@/components/work/Prose";
import { getAboutPage } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

/** /api/revalidate can purge "pages", "page:/about" or "pillars". */
export const revalidate = 3600;

export async function generateMetadata() {
  const about = await getAboutPage();
  if (!about) return {};
  const { page } = about;
  return pageMetadata({
    title: page.title,
    description: page.excerpt || page.header.intro,
    path: "/about",
    image: page.image,
  });
}

/** Clears the sticky header when a side-nav link jumps to a section. */
const SECTION = "scroll-mt-28";

/** Hairline-separated block after the first section. */
function AboutSection({
  id,
  heading,
  intro,
  children,
}: {
  id: string;
  heading: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`${SECTION} mt-20 border-t border-slate-200 pt-16 lg:mt-24 lg:pt-20`}
    >
      <h2 id={`${id}-heading`} className="text-3xl text-ink md:text-4xl">
        {heading}
      </h2>
      {intro ? <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{intro}</p> : null}
      <div className="mt-10">{children}</div>
    </section>
  );
}

/**
 * /about: a side nav, then four sections — Who we are (the WP page's Page
 * content box, featured image and body), Mission, Our focus (the homepage's
 * three pillars) and Board of directors. Empty sections are skipped, and
 * leave the nav with them.
 */
export default async function AboutPage() {
  const about = await getAboutPage();
  if (!about) notFound();
  const { page, mission, focus, board } = about;

  const nav: AboutNavItem[] = [
    { id: "who-we-are", label: page.header.heading },
    ...(mission.points.length ? [{ id: "mission", label: mission.heading }] : []),
    ...(focus.pillars.length ? [{ id: "our-focus", label: focus.heading }] : []),
    ...(board.members.length ? [{ id: "board", label: board.heading }] : []),
  ];

  return (
    <article className="bg-paper py-section lg:py-section-lg">
      <div className="mx-auto grid max-w-[1400px] gap-x-12 px-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:px-10 xl:grid-cols-[15rem_minmax(0,1fr)] xl:gap-x-16">
        <aside className="hidden lg:block">
          <div className="sticky top-28 pt-3">
            <AboutNav label={page.title} items={nav} />
          </div>
        </aside>

        <div className="max-w-4xl">
          <section id="who-we-are" className={SECTION}>
            {page.header.eyebrow ? (
              <Eyebrow accent="blue" className="mb-5">
                {page.header.eyebrow}
              </Eyebrow>
            ) : null}
            <h1 className="text-4xl break-words text-ink md:text-5xl lg:text-6xl">
              {page.header.heading}
            </h1>

            {page.image ? (
              <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100 lg:mt-12">
                <Image
                  src={page.image.url}
                  alt={page.image.alt}
                  fill
                  preload
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover"
                />
              </div>
            ) : null}

            {page.header.intro ? (
              <p className="mt-10 text-xl leading-relaxed font-semibold text-ink lg:text-2xl lg:leading-relaxed">
                {page.header.intro}
              </p>
            ) : null}

            {page.content ? (
              <div className="mt-6">
                <Prose html={page.content} />
              </div>
            ) : null}
          </section>

          {mission.points.length ? (
            <AboutSection id="mission" heading={mission.heading}>
              <ol>
                {mission.points.map((point, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-t border-slate-200 py-6 sm:grid-cols-[3.5rem_minmax(0,1fr)] lg:py-8"
                  >
                    <span aria-hidden="true" className="eyebrow pt-1.5 text-blue-700">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-lg leading-relaxed text-ink lg:text-xl">{point}</p>
                  </li>
                ))}
              </ol>
            </AboutSection>
          ) : null}

          {focus.pillars.length ? (
            <AboutSection id="our-focus" heading={focus.heading} intro={focus.intro}>
              <PillarCards
                pillars={focus.pillars}
                linkLabel={focus.linkLabel}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 260px"
                className="md:gap-6"
              />
            </AboutSection>
          ) : null}

          {board.members.length ? (
            <AboutSection id="board" heading={board.heading} intro={board.intro}>
              <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:gap-y-14">
                {board.members.map((member, i) => (
                  <li key={i} className="flex items-center gap-5 lg:gap-6">
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-full bg-slate-100 lg:size-32">
                      {member.photo ? (
                        <Image
                          src={member.photo.url}
                          alt={member.photo.alt}
                          fill
                          sizes="128px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg text-ink lg:text-xl">{member.name}</h3>
                      {member.role ? (
                        <p className="mt-2 leading-snug text-muted">{member.role}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </AboutSection>
          ) : null}
        </div>

      </div>
    </article>
  );
}
