import type { ReactNode } from "react";

/**
 * A small line of facts, e.g. status, timeframe and city, spaced apart
 * rather than separated by dots. Empty items are skipped.
 */
export function MetaLine({ items, className = "" }: { items: ReactNode[]; className?: string }) {
  const shown = items.filter((item) => item !== null && item !== undefined && item !== false && item !== "");
  if (shown.length === 0) return null;

  return (
    <p className={`flex flex-wrap gap-x-6 gap-y-1 ${className}`}>
      {shown.map((item, i) => (
        <span key={i}>{item}</span>
      ))}
    </p>
  );
}
