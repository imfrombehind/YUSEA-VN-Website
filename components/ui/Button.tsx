import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "coral" | "ink" | "outline" | "sun";

const VARIANTS: Record<Variant, string> = {
  coral: "bg-coral text-white hover:bg-coral-600",
  ink: "bg-ink text-white hover:bg-muted",
  sun: "bg-sun text-ink hover:bg-sun-600",
  outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
};

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
} & Omit<ComponentProps<typeof Link>, "href">;

/** Pill-shaped, sentence-case CTA. `outline` is the Our Focus button. */
export function ButtonLink({
  href,
  variant = "coral",
  className = "",
  children,
  ...rest
}: ButtonLinkProps) {
  // An empty ACF label means "no button", not a bare arrow.
  if (!children) return null;

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 font-display text-sm font-semibold transition-colors ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
      <span aria-hidden="true">&rarr;</span>
    </Link>
  );
}
