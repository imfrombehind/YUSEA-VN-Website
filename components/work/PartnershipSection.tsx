import Image from "next/image";
import { Prose } from "./Prose";
import type { Partner, Partnership } from "@/lib/cms/types";

/**
 * One partnership block on a project page ("Implementing agency",
 * "Funding partners"): heading, short intro, then each partner as a
 * round logo with its name beside it.
 */
export function PartnershipSection({
  partnership,
  className = "",
}: {
  partnership: Partnership;
  className?: string;
}) {
  const { heading, intro, partners } = partnership;

  return (
    <section className={`relative overflow-hidden bg-paper py-16 lg:py-24 ${className}`}>
      {/* A sliver of logo yellow on the left edge, as an accent only. */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 hidden w-12 bg-sun [clip-path:polygon(0_0,100%_0,0_45%)] lg:block"
      />

      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        {heading ? <h2 className="text-3xl text-ink sm:text-4xl">{heading}</h2> : null}
        {intro ? (
          <Prose html={intro} className={`max-w-4xl ${heading ? "mt-4" : ""}`} />
        ) : null}

        {partners.length > 0 ? (
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <li key={partner.name}>
                <PartnerItem partner={partner} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function PartnerItem({ partner }: { partner: Partner }) {
  const body = (
    <>
      <span className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white lg:size-36">
        {partner.logo ? (
          <Image
            src={partner.logo.url}
            // The name sits right beside it, so the logo is decorative.
            alt=""
            fill
            sizes="144px"
            className="object-contain p-5"
          />
        ) : (
          <span aria-hidden="true" className="font-display text-3xl font-extrabold text-slate-300">
            {partner.name.charAt(0)}
          </span>
        )}
      </span>
      <span className="font-display text-lg font-bold text-ink">{partner.name}</span>
    </>
  );

  const layout = "flex items-center gap-6";
  return partner.href ? (
    <a
      href={partner.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${layout} group [&>span:last-child]:underline-offset-4 [&>span:last-child]:group-hover:underline`}
    >
      {body}
    </a>
  ) : (
    <div className={layout}>{body}</div>
  );
}
