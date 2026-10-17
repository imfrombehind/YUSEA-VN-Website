/**
 * WordPress-rendered HTML (block editor or ACF WYSIWYG), styled with
 * Tailwind Typography. It comes from our own CMS, so it's trusted as HTML.
 */
export function Prose({ html, className = "" }: { html: string; className?: string }) {
  if (!html) return null;

  return (
    <div
      className={`prose prose-lg prose-yusea max-w-none break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
