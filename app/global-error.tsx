"use client";

import { useEffect } from "react";
import "./globals.css";

/**
 * Last resort, when the root layout itself fails (e.g. the site-settings
 * query). It replaces the whole document, so it brings its own <html> and
 * stylesheet, and like app/error.tsx its copy cannot come from the CMS.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <title>Something went wrong</title>
        <div aria-hidden="true" className="grid h-1 grid-cols-4">
          <span className="bg-ink" />
          <span className="bg-coral" />
          <span className="bg-blue" />
          <span className="bg-sun" />
        </div>
        <main className="mx-auto max-w-3xl px-6 py-section lg:px-10 lg:py-section-lg">
          <h1 className="text-4xl text-ink sm:text-5xl">Something went wrong</h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            The site could not be loaded. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-10 inline-flex items-center gap-2 bg-ink px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-muted"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
