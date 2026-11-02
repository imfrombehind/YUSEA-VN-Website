/** A project's hashtags, in accent blue, each opening its Facebook hashtag feed. */
export function Hashtags({ tags, className = "" }: { tags: string[]; className?: string }) {
  if (tags.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-x-4 gap-y-2 ${className}`}>
      {tags.map((tag) => (
        <li key={tag}>
          <a
            href={`https://www.facebook.com/hashtag/${encodeURIComponent(tag.toLowerCase())}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display font-semibold text-blue-700 underline-offset-4 hover:underline"
          >
            #{tag}
          </a>
        </li>
      ))}
    </ul>
  );
}
