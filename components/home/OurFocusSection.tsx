import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { pillarHref } from "@/lib/routes";
import type { Homepage } from "@/lib/cms/types";

/**
 * #homepage-focus — the three core pillars on a light slate ground.
 *
 * Section copy comes from ACF; the cards are the `pillar` taxonomy terms, so
 * each "Explore more" link carries the term slug into /work?pillar=<slug>,
 * which filters projects and publications to that pillar.
 */
export function OurFocusSection({ data }: { data: Homepage["ourFocus"] }) {
  if (data.pillars.length === 0) return null;

  return (
    <section id="homepage-focus" className="bg-slate-50 py-section lg:py-section-lg">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {data.eyebrow ? (
              <Eyebrow accent="blue" className="mb-4">
                {data.eyebrow}
              </Eyebrow>
            ) : null}
            <h2 className="text-3xl font-extrabold text-ink md:text-4xl">{data.heading}</h2>
          </div>
          <div className="shrink-0">
            <ButtonLink href={data.cta.href} variant="outline">
              {data.cta.label}
            </ButtonLink>
          </div>
        </div>

        <ul className="mt-12 grid gap-12 md:grid-cols-3 md:gap-8 lg:mt-16 lg:gap-10">
          {data.pillars.map((pillar) => (
            <li key={pillar.slug} className="flex flex-col">
              <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-slate-200">
                {pillar.image ? (
                  <Image
                    src={pillar.image.url}
                    alt={pillar.image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : null}
              </div>

              <div className="flex flex-1 flex-col pt-6">
                <h3 className="text-xl font-bold text-ink lg:text-2xl">{pillar.name}</h3>
                {pillar.description ? (
                  <p className="mt-3 leading-relaxed text-muted">{pillar.description}</p>
                ) : null}
                {data.linkLabel ? (
                  <Link
                    href={pillarHref(pillar.slug)}
                    className="mt-auto inline-flex items-center gap-1.5 pt-6 font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {data.linkLabel}
                    <span className="sr-only">: {pillar.name}</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
