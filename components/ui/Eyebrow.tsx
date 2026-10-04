import type { ReactNode } from "react";

/** One of the four logo colours, used as a small accent. */
export type Accent = "coral" | "blue" | "sun" | "ink";

/**
 * Bar in the full-strength logo colour, label in an AA-safe shade of it.
 * Sun is too light to read as text, so its label stays ink.
 */
const ACCENTS: Record<Accent, { bar: string; text: string }> = {
  coral: { bar: "bg-coral", text: "text-coral-700" },
  blue: { bar: "bg-blue", text: "text-blue-700" },
  sun: { bar: "bg-sun", text: "text-ink" },
  ink: { bar: "bg-ink", text: "text-ink" },
};

export function Eyebrow({
  accent = "coral",
  className = "",
  children,
}: {
  accent?: Accent;
  className?: string;
  children: ReactNode;
}) {
  const { bar, text } = ACCENTS[accent];

  return (
    <p className={`eyebrow flex items-center gap-3 ${text} ${className}`}>
      <span aria-hidden="true" className={`h-[3px] w-8 shrink-0 ${bar}`} />
      <span>{children}</span>
    </p>
  );
}
