import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/cms/types";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatPostDate(date: string): string {
  return dateFormat.format(new Date(date));
}

/** Featured image, topic + date, title, excerpt. Used on /blog and the homepage. */
export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col">
      <div className="relative aspect-[3/2] overflow-hidden bg-periwinkle">
        {post.image ? (
          <Image
            src={post.image.url}
            alt={post.image.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6 lg:p-8">
        <p className="eyebrow mb-3 text-coral">
          {post.topic ? `${post.topic} · ` : ""}
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
        </p>
        <h3 className="text-2xl text-navy group-hover:underline">
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="mt-4 leading-relaxed text-muted">{post.excerpt}</p>
        ) : null}
      </div>
    </Link>
  );
}
