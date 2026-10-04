import { PostCard } from "@/components/blog/PostCard";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Homepage } from "@/lib/cms/types";

/** #homepage-latest-posts — copy from ACF, posts from the same query. */
export function LatestPosts({
  latestPosts,
}: {
  latestPosts: Homepage["latestPosts"];
}) {
  if (latestPosts.posts.length === 0) return null;

  return (
    <section id="homepage-latest-posts" className="bg-tint-gray py-section lg:py-section-lg">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={latestPosts.eyebrow}
            title={latestPosts.heading}
            accent="ink"
          />
          <div className="shrink-0">
            <ButtonLink href={latestPosts.cta.href} variant="ink">
              {latestPosts.cta.label}
            </ButtonLink>
          </div>
        </div>

        <ul className="mt-14 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
          {latestPosts.posts.map((post) => (
            <li key={post.id} className="bg-paper">
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
