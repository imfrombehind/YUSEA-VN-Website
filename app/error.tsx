"use client";

import { useEffect } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * Runtime error inside a page; the header and footer still render around it.
 *
 * The one deliberate exception to "no copy in components": this page shows
 * when a render fails, and the likeliest cause is the CMS itself being down,
 * so its copy cannot depend on the CMS.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // The digest matches the server log line; swap for Sentry etc. later.
    console.error(error);
  }, [error]);

  return (
    <section className="bg-paper py-section lg:py-section-lg">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="max-w-3xl">
          <Eyebrow accent="coral" className="mb-5">
            Error
          </Eyebrow>
          <h1 className="text-4xl text-ink sm:text-5xl lg:text-6xl">
            Something went wrong
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            This page could not be loaded. Please try again in a moment.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => retry()}
              className="inline-flex items-center gap-2 bg-ink px-7 py-3.5 font-display text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-muted"
            >
              Try again
            </button>
            <ButtonLink href="/" variant="outline" className="text-ink">
              Homepage
            </ButtonLink>
          </div>
          {error.digest ? (
            <p className="mt-8 text-xs uppercase tracking-[0.12em] text-muted">
              Reference: {error.digest}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
