import { ButtonLink } from "@/components/ui/Button";
import { Prose } from "./Prose";
import type { VolunteerCall } from "@/lib/cms/types";

/** In-page anchor for the cover's volunteer button. Not shown to readers. */
export const VOLUNTEER_ANCHOR = "volunteer";

/**
 * A project's call for volunteers: heading and intro, the roles as cards
 * beside a benefits checklist, then a closing line and the register button.
 */
export function VolunteerSection({ volunteer }: { volunteer: VolunteerCall }) {
  const { heading, intro, rolesHeading, roles, benefitsHeading, benefits, closing, cta } =
    volunteer;

  return (
    <section
      id={VOLUNTEER_ANCHOR}
      // Clears the sticky site header when the cover button jumps here.
      className="scroll-mt-28 border-b border-slate-200 bg-paper py-section lg:py-section-lg"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="max-w-3xl">
          {heading ? <h2 className="text-4xl text-ink sm:text-5xl">{heading}</h2> : null}
          {intro ? <Prose html={intro} className={heading ? "mt-6" : ""} /> : null}
        </div>

        {roles.length > 0 || benefits.length > 0 ? (
          <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
            {roles.length > 0 ? (
              <div>
                {rolesHeading ? <h3 className="text-2xl text-ink">{rolesHeading}</h3> : null}
                <ul className={`grid gap-4 ${rolesHeading ? "mt-6" : ""}`}>
                  {roles.map((role) => (
                    <li key={role.title} className="rounded-2xl border border-slate-200 p-6">
                      <p className="font-display text-lg font-bold text-ink">{role.title}</p>
                      {role.description ? (
                        <p className="mt-2 leading-relaxed text-muted">{role.description}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {benefits.length > 0 ? (
              <div>
                {benefitsHeading ? <h3 className="text-2xl text-ink">{benefitsHeading}</h3> : null}
                <ul className={`space-y-4 ${benefitsHeading ? "mt-6" : ""}`}>
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-4 leading-relaxed text-muted">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="mt-1 size-5 shrink-0 text-blue-700"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {closing || (cta.label && cta.href) ? (
          <div className="mt-12 max-w-3xl">
            {closing ? <Prose html={closing} /> : null}
            {cta.href ? (
              <ButtonLink
                href={cta.href}
                target="_blank"
                rel="noopener noreferrer"
                className={closing ? "mt-8" : ""}
              >
                {cta.label}
              </ButtonLink>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
