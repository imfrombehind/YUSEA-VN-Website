/**
 * A homepage intro: a lead sentence in ink, then a grey sentence at the
 * same size, both at the h3 step (level with The context tab's heading). Used by the Our focus tab and Spotlight. Renders nothing
 * when both are empty.
 */
export function LeadIntro({ lead, intro }: { lead: string; intro: string }) {
  if (!lead && !intro) return null;

  return (
    <div className="max-w-5xl font-display">
      {lead ? (
        <p className="text-h3 text-ink">
          {lead}
        </p>
      ) : null}
      {intro ? (
        <p className="mt-1 text-h3 font-light text-muted">
          {intro}
        </p>
      ) : null}
    </div>
  );
}
