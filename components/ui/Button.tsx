import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "ink" | "outline" | "sun" | "light";

const VARIANTS: Record<Variant, string> = {
  ink: "bg-ink text-white hover:bg-black",
  sun: "bg-sun text-ink hover:bg-sun-600",
  outline: "border border-ink text-ink hover:bg-ink hover:text-white",
  /** Secondary button on a dark photo, e.g. the project cover. */
  light: "border border-white/80 text-white hover:bg-white hover:text-ink",
};

/** The pill shape, shared with the few buttons that aren't links. */
export const BUTTON_BASE =
  "inline-flex items-center gap-2 rounded-full px-6 py-3 font-display text-base font-normal tracking-tight transition-colors";

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  /** "down" for a link further down the same page. */
  arrow?: "none" | "down";
} & Omit<ComponentProps<typeof Link>, "href">;

/**
 * Pill-shaped, sentence-case button for a page's main action (register,
 * volunteer). Everything else is an ArrowLink.
 */
export function ButtonLink({
  href,
  variant = "ink",
  arrow = "none",
  className = "",
  children,
  ...rest
}: ButtonLinkProps) {
  // An empty ACF label means "no button", not an empty pill.
  if (!children) return null;

  return (
    <Link href={href} className={`${BUTTON_BASE} ${VARIANTS[variant]} ${className}`} {...rest}>
      {children}
      {arrow === "down" ? <span aria-hidden="true">{"↓"}</span> : null}
    </Link>
  );
}
