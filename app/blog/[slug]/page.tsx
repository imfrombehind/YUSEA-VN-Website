import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { formatPostDate } from "@/components/blog/PostCard";
import { getPostBySlug, getPosts } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

/** Same ISR window as the index; /api/revalidate can purge "post:<slug>". */
export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

/** Prerender the latest posts at build time; older ones render on first visit. */
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.image,
    type: "article",
    publishedTime: post.date,
  });
}

export default async function PostPage({ params }: Props) {
  const post = await getPostBySlug((await params).slug);
  if (!post) notFound();

  return (
    <article className="bg-paper py-section lg:py-section-lg">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <p className="eyebrow mb-5 text-coral-700">
          {post.topic ? `${post.topic} · ` : ""}
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
        </p>
        <h1 className="break-words text-4xl text-ink sm:text-5xl">{post.title}</h1>

        {post.image ? (
          <div className="relative mt-10 aspect-[3/2] bg-tint-blue">
            <Image
              src={post.image.url}
              alt={post.image.alt}
              fill
              preload
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        ) : null}

        {/* Rendered by WordPress from our own CMS, so trusted as HTML.
            Embeds, tables and code blocks from the block editor are kept
            inside the column so they never force horizontal scroll. */}
        <div
          className="mt-10 space-y-6 break-words text-lg [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto leading-relaxed text-ink [&_a]:text-coral-700 [&_a]:underline [&_h2]:mt-12 [&_h2]:text-3xl [&_h2]:text-ink [&_h3]:mt-10 [&_h3]:text-2xl [&_h3]:text-ink [&_img]:h-auto [&_img]:max-w-full [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  );
}
