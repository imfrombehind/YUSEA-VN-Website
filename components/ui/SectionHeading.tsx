type SectionHeadingProps = {
  title: string;
  /** Light grey line under the title, at lead size. */
  body?: string;
  className?: string;
  /** "h1" when this heading is the page title (e.g. /work). */
  as?: "h1" | "h2";
};

/** A page or section title in the homepage style: large, regular weight, tight. */
export function SectionHeading({ title, body, className = "", as: Heading = "h2" }: SectionHeadingProps) {
  return (
    <div className={`max-w-5xl ${className}`}>
      <Heading className="text-ink">{title}</Heading>

      {body ? (
        <p className="mt-6 max-w-4xl text-2xl leading-snug font-light tracking-[-0.02em] text-muted md:text-[2rem]">
          {body}
        </p>
      ) : null}
    </div>
  );
}
