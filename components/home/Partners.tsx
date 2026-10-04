import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { Homepage, Partner } from "@/lib/cms/types";

const TIER_ORDER: Partner["tier"][] = ["funder", "lead", "partner"];

/**
 * #homepage-section-4 — geometric split-screen: contextual photo on one half,
 * copy + CTA + monochromatic logo grid on the other (spec §5).
 *
 * Logos are grouped by tier rather than shown as one flat grid. The reference
 * site does this too, and the tier is meaningful: a funder is not a delivery
 * partner. If YUSEA's relationships are genuinely flat, delete the grouping
 * and render `partners` directly.
 */
export function Partners({
  partners,
  logos,
}: {
  partners: Homepage["partners"];
  logos: Partner[];
}) {
  const tiers = TIER_ORDER.map((tier) => ({
    tier,
    items: logos.filter((l) => l.tier === tier),
  })).filter((group) => group.items.length > 0);

  return (
    <section id="homepage-section-4" className="bg-paper">
      <div className="grid lg:grid-cols-2">
        {/* Half one: contextual photo. */}
        <div className="relative min-h-[320px] bg-tint-blue lg:min-h-[640px]">
          {partners.image.url ? (
            <Image
              src={partners.image.url}
              alt={partners.image.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(140deg,var(--color-tint-blue)_0%,var(--color-tint-gray)_55%,var(--color-tint-warm)_100%)]"
            />
          )}
        </div>

        {/* Half two: copy, CTA, logo grid. */}
        <div className="flex flex-col justify-center px-6 py-section lg:px-16 lg:py-section-lg">
          {partners.eyebrow ? (
            <Eyebrow accent="blue" className="mb-5">
              {partners.eyebrow}
            </Eyebrow>
          ) : null}
          <h2 className="text-4xl text-ink lg:text-5xl">{partners.heading}</h2>
          <p className="mt-6 max-w-xl leading-relaxed text-muted">
            {partners.body}
          </p>

          <div className="mt-9">
            <ButtonLink href={partners.cta.href} variant="ink">
              {partners.cta.label}
            </ButtonLink>
          </div>

          <div className="mt-14 space-y-9">
            {tiers.map(({ tier, items }) => (
              <div key={tier}>
                <p className="eyebrow mb-4 text-faint">{partners.tierLabels[tier]}</p>
                <ul className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3">
                  {items.map((partner) => (
                    <li
                      key={partner.name}
                      className="flex min-h-[88px] items-center justify-center bg-paper p-4"
                    >
                      {partner.logo?.url ? (
                        <Image
                          src={partner.logo.url}
                          alt={partner.logo.alt || partner.name}
                          width={140}
                          height={56}
                          /* Monochromatic treatment per spec §5. */
                          className="h-auto w-full max-w-[140px] object-contain grayscale transition-[filter] duration-300 hover:grayscale-0"
                        />
                      ) : (
                        <span className="text-center text-xs uppercase tracking-[0.12em] text-faint">
                          {partner.name}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
