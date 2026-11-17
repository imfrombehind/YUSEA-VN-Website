import Link from "next/link";
import type { ComponentProps } from "react";

type ArrowLinkProps = {
  href: string;
} & Omit<ComponentProps<typeof Link>, "href">;

/**
 * A quiet text link with a thin chevron, e.g. "More stories ›". The
 * homepage's secondary action; colour comes from the parent.
 */
export function ArrowLink({ href, className = "", children, ...rest }: ArrowLinkProps) {
  // An empty ACF label means "no link", not a bare chevron.
  if (!children) return null;

  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 font-display text-lg font-normal tracking-tight hover:underline hover:underline-offset-4 sm:text-xl ${className}`}
      {...rest}
    >
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5 shrink-0 transition-transform group-hover:translate-x-1"
      >
        <path d="m9 5 7 7-7 7" />
      </svg>
    </Link>
  );
}
