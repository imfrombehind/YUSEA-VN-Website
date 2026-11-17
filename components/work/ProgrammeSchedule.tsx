import Image from "next/image";
import { formatDayLong } from "@/lib/format";
import type { Programme } from "@/lib/cms/types";

/**
 * A programme's days, each a heading over its sessions: times (with the
 * time zone) at left, then title, speakers and description, and the photo
 * at right when there is one. Hairlines between sessions.
 */
export function ProgrammeSchedule({ programme }: { programme: Programme }) {
  return (
    <div className="space-y-20 lg:space-y-24">
      {programme.days.map((day) => (
        <section key={day.date} aria-labelledby={`day-${day.date}`}>
          <h2 id={`day-${day.date}`} className="text-ink">
            <time dateTime={day.date}>{formatDayLong(day.date)}</time>
          </h2>

          {day.sessions.length > 0 ? (
            <ol className="mt-8 border-b border-slate-200">
              {day.sessions.map((session, i) => {
                const time = [session.start, session.end].filter(Boolean).join(" – ");
                return (
                  <li
                    key={i}
                    className="grid gap-4 border-t border-slate-200 py-8 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-10 lg:grid-cols-[11rem_minmax(0,1fr)_18rem]"
                  >
                    <p className="font-display text-2xl leading-tight font-light tracking-[-0.02em] text-ink">
                      {time}
                      {time && programme.timezone ? (
                        <span className="mt-1 block text-base font-normal tracking-tight text-muted">
                          {programme.timezone}
                        </span>
                      ) : null}
                    </p>

                    <div className="min-w-0">
                      <h3 className="text-ink">{session.title}</h3>
                      {session.speakers ? (
                        <p className="mt-2 font-display text-lg tracking-tight text-muted">
                          {session.speakers}
                        </p>
                      ) : null}
                      {session.description ? (
                        <p className="mt-4 max-w-2xl leading-relaxed text-muted">{session.description}</p>
                      ) : null}
                    </div>

                    {session.image ? (
                      <div className="relative aspect-[3/2] overflow-hidden bg-slate-100 md:col-start-2 lg:col-start-auto">
                        <Image
                          src={session.image.url}
                          alt={session.image.alt}
                          fill
                          sizes="(max-width: 1024px) 100vw, 288px"
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          ) : null}
        </section>
      ))}
    </div>
  );
}
