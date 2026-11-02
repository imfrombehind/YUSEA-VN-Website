import { ButtonLink } from "@/components/ui/Button";
import { formatDayMonthYear } from "@/lib/format";
import type { Registration, RegistrationRow } from "@/lib/cms/types";

type RegistrationCardProps = {
  registration: Registration;
  /** Past the deadline: the button gives way to `closedLabel`. */
  closed: boolean;
  deadlineLabel: string;
  closedLabel: string;
  className?: string;
};

/**
 * The sign-up card beside a project's Overview: schedule, key facts
 * (duration, group size, fee), the register button, deadline and a note.
 * Sticky on desktop so the button stays in reach while the Overview scrolls.
 */
export function RegistrationCard({
  registration,
  closed,
  deadlineLabel,
  closedLabel,
  className = "",
}: RegistrationCardProps) {
  const { heading, schedule, facts, cta, deadline, note } = registration;
  const hasButton = Boolean(cta.label && cta.href);

  return (
    <aside className={`rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 ${className}`}>
      {heading ? <h2 className="text-2xl text-ink sm:text-3xl">{heading}</h2> : null}

      <Rows rows={schedule} className={heading ? "mt-6" : ""} />
      <Rows
        rows={facts}
        className={schedule.length > 0 ? "mt-6 border-t border-slate-200 pt-6" : heading ? "mt-6" : ""}
      />

      {hasButton || deadline || note ? (
        <div className="mt-8 border-t border-slate-200 pt-6">
          {hasButton && !closed ? (
            <ButtonLink
              href={cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full justify-center"
            >
              {cta.label}
            </ButtonLink>
          ) : null}
          {hasButton && closed && closedLabel ? (
            <p className="rounded-full bg-slate-100 px-6 py-2.5 text-center font-display text-sm font-semibold text-muted">
              {closedLabel}
            </p>
          ) : null}

          {deadline && !closed ? (
            <p className="mt-4 text-center text-sm text-muted">
              {deadlineLabel ? `${deadlineLabel}: ` : ""}
              <time dateTime={deadline} className="font-semibold text-ink">
                {formatDayMonthYear(deadline)}
              </time>
            </p>
          ) : null}
          {note ? <p className="mt-4 text-sm leading-relaxed text-muted">{note}</p> : null}
        </div>
      ) : null}
    </aside>
  );
}

function Rows({ rows, className = "" }: { rows: RegistrationRow[]; className?: string }) {
  if (rows.length === 0) return null;

  return (
    <dl className={`space-y-4 ${className}`}>
      {rows.map((row, i) => (
        <div key={i}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <dt className="text-sm text-muted">{row.label}</dt>
            <dd className="font-display font-semibold text-ink">{row.value}</dd>
          </div>
          {row.note ? <dd className="mt-1 text-sm leading-snug text-muted">{row.note}</dd> : null}
        </div>
      ))}
    </dl>
  );
}
