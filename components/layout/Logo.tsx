import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/lib/cms/types";

type LogoProps = Pick<SiteSettings, "siteName" | "logo"> & {
  /** "lg" in the footer, where there's room for a bigger mark. */
  size?: "md" | "lg";
  className?: string;
};

/** The footer ("lg") stays a step larger than the header ("md") at every breakpoint. */
const SIZES = {
  md: { text: "text-[2.8125rem] lg:text-[3.375rem]", image: "h-15 lg:h-18" },
  lg: { text: "text-7xl lg:text-[5.625rem]", image: "h-21 lg:h-24" },
};

/**
 * The ACF logo image if one is set, otherwise the site name as a wordmark.
 * Keep uploaded logos roughly 160×32 so the header does not shift.
 */
export function Logo({
  siteName,
  logo,
  size = "md",
  className = "",
}: LogoProps) {
  return (
    <Link
      href="/"
      className={`font-display ${SIZES[size].text} font-bold uppercase tracking-[0.1em] text-ink ${className}`}
    >
      {logo ? (
        <Image
          src={logo.url}
          alt={logo.alt || siteName}
          width={logo.width ?? 160}
          height={logo.height ?? 32}
          className={`${SIZES[size].image} w-auto`}
        />
      ) : (
        <>
          {siteName}
          <span aria-hidden="true" className="text-coral">.</span>
        </>
      )}
    </Link>
  );
}
