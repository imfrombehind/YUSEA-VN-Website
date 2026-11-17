type SectionHeadingProps = {
  title: string;
  body?: string;
  className?: string;
  /** "h1" when this heading is the page title (e.g. /blog). */
  as?: "h1" | "h2";
};

export function SectionHeading({ title, body, className = "", as: Heading = "h2" }: SectionHeadingProps) {
  return (
    <div className={`max-w-3xl ${className}`}>
      <Heading className="text-4xl text-ink sm:text-5xl lg:text-6xl">{title}</Heading>

      {body ? (
        <p className="mt-6 text-lg leading-relaxed text-muted">{body}</p>
      ) : null}
    </div>
  );
}
