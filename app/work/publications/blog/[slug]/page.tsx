import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PillarTags } from "@/components/work/PillarTags";
import { Prose } from "@/components/work/Prose";
import { getPostBySlug, getPosts, getSiteSettings } from "@/lib/cms";
import { formatDate } from "@/lib/format";
import { publicationHref } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

/** /api/revalidate can purge "posts" or just "post:<slug>". */
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
    path: publicationHref(post),
    image: post.image,
    type: "article",
    publishedTime: post.date,
  });
}

/** Single blog article. */
export default async function PostPage({ params }: Props) {
  const [post, { work }] = await Promise.all([
    getPostBySlug((await params).slug),
    getSiteSettings(),
  ]);
  if (!post) notFound();

  const eyebrow = post.topic || work.kind.blog;

  return (
    <article className="bg-paper py-section lg:py-section-lg">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <p className="text-sm text-muted">
          {eyebrow ? <span className="font-semibold text-blue-700">{eyebrow} · </span> : null}
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight break-words text-ink sm:text-5xl">
          {post.title}
        </h1>
        <PillarTags pillars={post.pillars} className="mt-8" />

        {post.image ? (
          <div className="relative mt-10 aspect-[3/2] overflow-hidden rounded-2xl bg-slate-100">
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

        <Prose html={post.content} className="mt-10" />
      </div>
    </article>
  );
}
