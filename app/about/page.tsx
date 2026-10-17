import Image from "next/image";
import { notFound } from "next/navigation";
import { Prose } from "@/components/work/Prose";
import { getPageByUri } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

/** /api/revalidate can purge "pages" or just "page:/about". */
export const revalidate = 3600;

export async function generateMetadata() {
  const page = await getPageByUri("/about");
  if (!page) return {};
  return pageMetadata({
    title: page.title,
    description: page.excerpt,
    path: "/about",
    image: page.image,
  });
}

/**
 * The WordPress page at /about: title, featured image, block-editor body.
 * The excerpt (enable it for pages in WP) is the meta description only.
 */
export default async function AboutPage() {
  const page = await getPageByUri("/about");
  if (!page) notFound();

  return (
    <article className="bg-paper py-section lg:py-section-lg">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <header className="max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-tight break-words text-ink md:text-5xl lg:text-6xl">
            {page.title}
          </h1>
        </header>

        {page.image ? (
          <div className="relative mt-12 aspect-[21/9] overflow-hidden rounded-2xl bg-slate-100 lg:mt-16">
            <Image
              src={page.image.url}
              alt={page.image.alt}
              fill
              preload
              sizes="(max-width: 1400px) 100vw, 1400px"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="mt-12 max-w-3xl lg:mt-16">
          <Prose html={page.content} />
        </div>
      </div>
    </article>
  );
}
