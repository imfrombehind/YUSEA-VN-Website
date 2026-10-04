import { Eyebrow, type Accent } from "./Eyebrow";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  body?: string;
  className?: string;
  /** Which logo colour this section's eyebrow picks up. */
  accent?: Accent;
};

export function SectionHeading({
  eyebrow,
  title,
  body,
  className = "",
  accent = "coral",
}: SectionHeadingProps) {
  return (
    <div className={`max-w-3xl ${className}`}>
      {eyebrow ? (
        <Eyebrow accent={accent} className="mb-5">
          {eyebrow}
        </Eyebrow>
      ) : null}

      <h2 className="text-4xl text-ink sm:text-5xl lg:text-6xl">{title}</h2>

      {body ? (
        <p className="mt-6 text-lg leading-relaxed text-muted">{body}</p>
      ) : null}
    </div>
  );
}
