import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AboutNav, type AboutNavItem } from "@/components/about/AboutNav";
import { PillarCards } from "@/components/work/PillarCards";
import { Prose } from "@/components/work/Prose";
import { getAboutPage } from "@/lib/cms";
import { aboutSections } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

/** /api/revalidate can purge "pages", "page:/about" or "pillars". */
export const revalidate = 3600;

export async function generateMetadata() {
  const about = await getAboutPage();
  if (!about) return {};
  const { page } = about;
  return pageMetadata({
    title: page.title,
    description: page.excerpt || paragraphs(page.header.intro)[0],
    path: "/about",
    image: page.image,
  });
}

/** The Intro box is plain text: each line is a paragraph, blank lines ignored. */
function paragraphs(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Clears the sticky header when a side-nav link jumps to a section. */
const SECTION = "scroll-mt-24";

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
      <h2 id={`${id}-heading`} className="text-ink">
        {heading}
      </h2>
      {intro ? (
        <p className="mt-4 max-w-3xl text-2xl leading-snug font-light tracking-[-0.02em] text-muted">
          {intro}
        </p>
      ) : null}
      <div className="mt-10">{children}</div>
    </section>
  );
}

/**
 * /about: a side nav, then four sections — Who we are (the WP page's Page
 * content box and body), Mission, Our focus (the homepage's
 * three pillars) and Board of directors. Empty sections are skipped, and
 * leave the nav with them.
 */
export default async function AboutPage() {
  const about = await getAboutPage();
  if (!about) notFound();
  const { page, mission, focus, board } = about;
  const intro = paragraphs(page.header.intro);

  const nav: AboutNavItem[] = aboutSections(about);

  return (
    <article className="bg-paper py-section lg:py-section-lg">
      <div className="mx-auto grid max-w-[1400px] gap-x-12 px-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:px-10 xl:grid-cols-[15rem_minmax(0,1fr)] xl:gap-x-16">
        <aside className="hidden lg:block">
          <div className="sticky top-24 pt-3">
            <AboutNav label={page.title} items={nav} />
          </div>
        </aside>

        <div className="max-w-4xl">
          <section id="who-we-are" className={SECTION}>
            <h1 className="break-words text-ink">
              {page.header.heading}
            </h1>


            {intro.length ? (
              <div className="mt-8 space-y-6">
                {intro.map((paragraph, i) => (
                  <p key={i} className="font-display text-2xl leading-snug tracking-[-0.02em] text-ink lg:text-[1.75rem]">
                    {paragraph}
                  </p>
                ))}
              </div>
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
                    <span aria-hidden="true" className="font-display text-2xl leading-none font-light tracking-tight text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="font-display text-xl leading-snug tracking-tight text-ink lg:text-2xl">{point}</p>
                  </li>
                ))}
              </ol>
            </AboutSection>
          ) : null}

          {focus.pillars.length ? (
            <AboutSection id="our-focus" heading={focus.heading} intro={focus.intro}>
              <PillarCards
                pillars={focus.pillars}
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
                      <h3 className="text-ink">{member.name}</h3>
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
