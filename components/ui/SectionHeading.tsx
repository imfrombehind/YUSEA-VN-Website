import { Eyebrow, type Accent } from "./Eyebrow";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  body?: string;
  className?: string;
  /** Which logo colour this section's eyebrow picks up. */
  accent?: Accent;
  /** "h1" when this heading is the page title (e.g. /blog). */
  as?: "h1" | "h2";
};

export function SectionHeading({
  eyebrow,
  title,
  body,
  className = "",
  accent = "coral",
  as: Heading = "h2",
}: SectionHeadingProps) {
  return (
    <div className={`max-w-3xl ${className}`}>
      {eyebrow ? (
        <Eyebrow accent={accent} className="mb-5">
          {eyebrow}
        </Eyebrow>
      ) : null}

      <Heading className="text-4xl text-ink sm:text-5xl lg:text-6xl">{title}</Heading>

      {body ? (
        <p className="mt-6 text-lg leading-relaxed text-muted">{body}</p>
      ) : null}
    </div>
  );
}
