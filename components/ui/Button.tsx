import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "coral" | "navy" | "outline" | "sun";

const VARIANTS: Record<Variant, string> = {
  coral: "bg-coral text-white hover:bg-coral-600",
  navy: "bg-navy text-white hover:bg-navy-600",
  sun: "bg-sun text-navy hover:bg-sun-600",
  outline:
    "bg-transparent text-current ring-2 ring-current hover:bg-current/10",
};

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
} & Omit<ComponentProps<typeof Link>, "href">;

/**
 * Square-cornered by design: the reference aesthetic is color-blocked and
 * geometric, so no border radius anywhere.
 */
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
      className={`inline-flex items-center gap-2 px-7 py-3.5 font-display text-sm font-bold uppercase tracking-[0.12em] transition-colors ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
      <span aria-hidden="true">&rarr;</span>
    </Link>
  );
}
