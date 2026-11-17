"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Media } from "@/lib/cms/types";
import { MetaLine } from "@/components/ui/MetaLine";

const INTERVAL_MS = 6000;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** One photo, optionally captioned with the project it belongs to. */
export type HeroSlide = {
  image: Media;
  title?: string;
  /** Small facts above the title, e.g. ["Đang diễn ra", "Can Tho"]. */
  meta?: string[];
  href?: string;
};

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Crossfading hero photos, advancing on their own. Each photo is shown
 * whole (`object-contain`) — project covers are often posters with text to
 * the edges, which a crop would cut — over a blurred, dimmed copy of itself
 * that fills the panel. A slide with a title gets a caption in its own band
 * below the photo, linking to its project, so it never covers the poster.
 *
 * The first slide is preloaded (it's the LCP image); the rest load lazily
 * behind it. The blurred copies load at a tiny size.
 *
 * No pause control, by the client's choice — note WCAG 2.2.2 asks for one
 * on auto-advancing content. With "reduce motion" on, it never advances.
 */
export function HeroSlideshow({
  slides,
  sizes = "100vw",
}: {
  slides: HeroSlide[];
  sizes?: string;
}) {
  const [active, setActive] = useState(0);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
  const animate = slides.length > 1 && !reducedMotion;

  useEffect(() => {
    if (!animate) return;
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [animate, slides.length]);

  const current = slides[active];
  const fade = (i: number) =>
    `transition-opacity duration-1000 ease-in-out ${i === active ? "opacity-100" : "opacity-0"}`;

  return (
    <>
      {/* The ambient fill: each photo blurred to cover the panel, dimmed so
          the white caption stays legible on light posters. */}
      <div aria-hidden="true" className="absolute inset-0">
        {slides.map((slide, i) => (
          <Image
            key={slide.image.url}
            src={slide.image.url}
            alt=""
            fill
            sizes="96px"
            className={`scale-150 object-cover blur-3xl ${fade(i)}`}
          />
        ))}
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="absolute inset-0 flex flex-col">
        <div className={`relative mx-6 mt-6 min-h-0 flex-1 lg:mx-10 lg:mt-10 ${current?.title ? "" : "mb-6 lg:mb-10"}`}>
          {slides.map((slide, i) => (
            <Image
              key={slide.image.url}
              src={slide.image.url}
              // Only the visible slide is announced.
              alt={i === active ? slide.image.alt : ""}
              aria-hidden={i === active ? undefined : true}
              fill
              preload={i === 0}
              sizes={sizes}
              className={`object-contain ${fade(i)}`}
            />
          ))}
        </div>

        {current?.title ? (
          <div className="flex shrink-0 items-end justify-between gap-6 p-6 lg:p-10">
            <div key={current.image.url} className="max-w-md text-white motion-safe:animate-fade-in">
              {current.meta ? <MetaLine items={current.meta} className="font-display text-base text-white/85" /> : null}
              {current.href ? (
                <Link
                  href={current.href}
                  className="mt-1 inline-flex items-center gap-2 font-display text-xl font-light tracking-tight hover:underline hover:underline-offset-4 lg:text-2xl"
                >
                  {current.title}
                  <span aria-hidden="true">&rsaquo;</span>
                </Link>
              ) : (
                <p className="mt-1 font-display text-xl font-light tracking-tight lg:text-2xl">{current.title}</p>
              )}
            </div>

            {slides.length > 1 ? (
              <div aria-hidden="true" className="flex shrink-0 gap-1.5 pb-2">
                {slides.map((slide, i) => (
                  <span
                    key={slide.image.url}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      i === active ? "w-8 bg-white" : "w-3 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
