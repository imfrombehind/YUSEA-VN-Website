import Image from "next/image";
import { Prose } from "./Prose";
import type { Partner, Partnership } from "@/lib/cms/types";

/**
 * One partnership block on a project page ("Implementing agency",
 * "Funding partners"): heading, short intro, then each partner as a
 * round logo (if it has one) with its name beside it.
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
    <section className={`bg-paper py-16 lg:py-24 ${className}`}>

      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        {heading ? <h2 className="text-3xl text-ink sm:text-4xl">{heading}</h2> : null}
        {intro ? (
          <Prose html={intro} className={`max-w-4xl ${heading ? "mt-4" : ""}`} />
        ) : null}

        {partners.length > 0 ? (
          <ul className="mt-10 grid items-center gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
      {partner.logo ? (
        <span className="relative size-28 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white lg:size-36">
          <Image
            src={partner.logo.url}
            // The name sits right beside it, so the logo is decorative.
            alt=""
            fill
            sizes="144px"
            className="object-contain p-5"
          />
        </span>
      ) : null}
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
