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
 * Crossfading hero photos, advancing on their own. Each photo fills a
 * full-width 3:2 box at the top of the panel — the project cards' frame, so
 * a cover designed as a 3:2 poster shows whole — and that box sets the
 * panel's height. Below it, a blurred, dimmed copy of the photo is the
 * ground for the caption, which links to the project.
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

      <div className="relative flex flex-1 flex-col">
        {/* 3:2, framed like the project cards (`ProjectCard`), full width and
            flush with the top: covers fill it edge to edge. */}
        <div className="relative aspect-[3/2] w-full shrink-0">
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
              className={`object-cover ${fade(i)}`}
            />
          ))}
        </div>

        {current?.title ? (
          // Same bottom padding and row heights (28px rows, 16px apart) as
          // the headline panel's two links, so the lines sit level with them.
          <div className="mt-auto flex items-end justify-between gap-6 px-6 pt-8 pb-14 sm:pb-16 lg:px-10 lg:pb-14">
            <div key={current.image.url} className="flex max-w-md flex-col gap-4 text-white motion-safe:animate-fade-in">
              {current.meta ? (
                <MetaLine items={current.meta} className="font-display text-base leading-7 text-white/85" />
              ) : null}
              {current.href ? (
                <Link
                  href={current.href}
                  className="inline-flex items-center gap-2 self-start font-display text-xl leading-7 font-light tracking-tight hover:underline hover:underline-offset-4 lg:text-2xl lg:leading-7"
                >
                  {current.title}
                  <span aria-hidden="true">&rsaquo;</span>
                </Link>
              ) : (
                <p className="font-display text-xl leading-7 font-light tracking-tight lg:text-2xl lg:leading-7">{current.title}</p>
              )}
            </div>

            {slides.length > 1 ? (
              <div aria-hidden="true" className="flex shrink-0 gap-1.5 pb-3">
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
