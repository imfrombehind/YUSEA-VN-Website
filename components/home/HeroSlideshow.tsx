"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Media } from "@/lib/cms/types";

const INTERVAL_MS = 6000;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Crossfading hero photos, advancing on their own. The first slide is
 * preloaded (it's the LCP image); the rest load lazily behind it.
 *
 * No pause control, by the client's choice — note WCAG 2.2.2 asks for one
 * on auto-advancing content. With "reduce motion" on, it never advances.
 */
export function HeroSlideshow({ slides }: { slides: Media[] }) {
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

  return slides.map((slide, i) => (
    <Image
      key={slide.url}
      src={slide.url}
      // Only the visible slide is announced.
      alt={i === active ? slide.alt : ""}
      aria-hidden={i === active ? undefined : true}
      fill
      preload={i === 0}
      sizes="100vw"
      className={`object-cover transition-opacity duration-1000 ease-in-out ${
        i === active ? "opacity-100" : "opacity-0"
      }`}
    />
  ));
}
