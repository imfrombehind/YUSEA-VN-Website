/**
 * A homepage intro: a lead sentence in ink, then a grey sentence at the
 * same size. Used by the Our focus tab and Spotlight. Renders nothing
 * when both are empty.
 */
export function LeadIntro({ lead, intro }: { lead: string; intro: string }) {
  if (!lead && !intro) return null;

  return (
    <div className="max-w-5xl font-display">
      {lead ? (
        <p className="text-3xl leading-tight font-normal tracking-[-0.025em] text-ink md:text-[2.5rem]">
          {lead}
        </p>
      ) : null}
      {intro ? (
        <p className="mt-2 text-3xl leading-tight font-light tracking-[-0.025em] text-muted md:text-[2.5rem]">
          {intro}
        </p>
      ) : null}
    </div>
  );
}
