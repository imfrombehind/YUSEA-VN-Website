"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Media } from "@/lib/cms/types";

const INTERVAL_MS = 6000;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** One photo, optionally captioned with the project it belongs to. */
export type HeroSlide = {
  image: Media;
  title?: string;
  /** Small line above the title, e.g. "Đang diễn ra · Can Tho". */
  meta?: string;
  href?: string;
};

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Crossfading hero photos, advancing on their own. The first slide is
 * preloaded (it's the LCP image); the rest load lazily behind it. A slide
 * with a title gets a caption linking to its project.
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

  return (
    <>
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
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {current?.title ? (
        <>
          {/* Keeps the caption legible over any photo. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(0deg,rgb(0_0_0/0.65)_0%,rgb(0_0_0/0)_100%)]"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 lg:p-10">
            <div key={current.image.url} className="max-w-md text-white motion-safe:animate-fade-in">
              {current.meta ? <p className="text-sm text-white/85">{current.meta}</p> : null}
              {current.href ? (
                <Link
                  href={current.href}
                  className="mt-1 inline-flex items-center gap-2 text-xl font-semibold hover:underline lg:text-2xl"
                >
                  {current.title}
                  <span aria-hidden="true">&rsaquo;</span>
                </Link>
              ) : (
                <p className="mt-1 text-xl font-semibold lg:text-2xl">{current.title}</p>
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
        </>
      ) : null}
    </>
  );
}
