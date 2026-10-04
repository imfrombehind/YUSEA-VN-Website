import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/lib/cms/types";

type LogoProps = Pick<SiteSettings, "siteName" | "logo"> & {
  className?: string;
};

/**
 * The ACF logo image if one is set, otherwise the site name as a wordmark.
 * Keep uploaded logos roughly 160×32 so the header does not shift.
 */
export function Logo({ siteName, logo, className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`font-display text-2xl font-bold uppercase tracking-[0.1em] text-white ${className}`}
    >
      {logo ? (
        <Image
          src={logo.url}
          alt={logo.alt || siteName}
          width={logo.width ?? 160}
          height={logo.height ?? 32}
          className="h-8 w-auto"
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
