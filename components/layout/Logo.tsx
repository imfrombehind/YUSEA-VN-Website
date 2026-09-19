import Link from "next/link";

/**
 * Wordmark placeholder. Swap for the real YUSEA asset (SVG preferred) once
 * brand files exist — keep the same dimensions so the header does not shift.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`font-display text-2xl font-bold uppercase tracking-[0.1em] text-white ${className}`}
    >
      YUSEA
      <span className="text-coral">.</span>
    </Link>
  );
}
