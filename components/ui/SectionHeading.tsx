type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  body?: string;
  className?: string;
  /** Inverts colours for use on navy / dark grounds. */
  tone?: "dark" | "light";
};

export function SectionHeading({
  eyebrow,
  title,
  body,
  className = "",
  tone = "dark",
}: SectionHeadingProps) {
  const isLight = tone === "light";

  return (
    <div className={`max-w-3xl ${className}`}>
      {eyebrow ? (
        <p className={`eyebrow mb-5 ${isLight ? "text-sun" : "text-coral"}`}>
          {eyebrow}
        </p>
      ) : null}

      <h2
        className={`text-4xl sm:text-5xl lg:text-6xl ${
          isLight ? "text-white" : "text-navy"
        }`}
      >
        {title}
      </h2>

      {body ? (
        <p
          className={`mt-6 text-lg leading-relaxed ${
            isLight ? "text-white/75" : "text-muted"
          }`}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}
