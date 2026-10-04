import type { Metadata } from "next";
import { PostCard } from "@/components/blog/PostCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPosts, getSiteSettings } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  const { blog } = await getSiteSettings();
  return { title: blog.heading, description: blog.intro || undefined };
}

/**
 * ISR: rebuilt at most hourly. A publish in WordPress purges sooner via
 * /api/revalidate with { "tags": ["posts"] }.
 */
export const revalidate = 3600;

export default async function BlogPage() {
  const [posts, { blog }] = await Promise.all([getPosts(), getSiteSettings()]);

  return (
    <section className="bg-paper py-section lg:py-section-lg">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading
          eyebrow={blog.eyebrow}
          title={blog.heading}
          body={blog.intro || undefined}
        />

        {posts.length === 0 ? (
          <p className="mt-14 text-muted">{blog.emptyText}</p>
        ) : (
          <ul className="mt-14 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id} className="bg-paper">
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
