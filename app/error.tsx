"use client";

import { useEffect } from "react";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { BUTTON_BASE } from "@/components/ui/Button";

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
          <h1 className="text-5xl text-ink lg:text-7xl">
            Something went wrong
          </h1>
          <p className="mt-6 text-2xl leading-snug font-light tracking-[-0.02em] text-muted">
            This page could not be loaded. Please try again in a moment.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-8">
            <button
              type="button"
              onClick={() => retry()}
              className={`${BUTTON_BASE} bg-ink text-white hover:bg-black`}
            >
              Try again
            </button>
            <ArrowLink href="/" className="text-ink">
              Homepage
            </ArrowLink>
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
