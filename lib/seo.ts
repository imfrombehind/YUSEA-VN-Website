import type { Metadata } from "next";
import { getSiteSettings, type Media } from "@/lib/cms";

/**
 * The public origin, used for canonical URLs, Open Graph, robots.txt and the
 * sitemap. SITE_URL wins; on Vercel the production domain is the fallback, so
 * preview deployments still point canonicals at production.
 */
export function siteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

/**
 * Only the production deployment should be indexed. Off Vercel (VERCEL_ENV
 * unset), a production build counts as production.
 */
export function isIndexable(): boolean {
  return process.env.VERCEL_ENV
    ? process.env.VERCEL_ENV === "production"
    : process.env.NODE_ENV === "production";
}

type PageMetadata = {
  /** Omit on the homepage to use the CMS default title. */
  title?: string;
  description?: string;
  /** Path from the site root, e.g. "/blog". Becomes the canonical URL. */
  path: string;
  /** Overrides the CMS default share image. */
  image?: Media;
  type?: "website" | "article";
  publishedTime?: string;
};

/**
 * Per-page metadata. Next merges metadata shallowly, so a page that sets
 * `openGraph` replaces the layout's whole object; this rebuilds it in full
 * each time, keeping og:url, og:title and the image in step with the page.
 */
export async function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
}: PageMetadata): Promise<Metadata> {
  const { siteName, seo } = await getSiteSettings();
  const shareTitle = title ? `${title} | ${siteName}` : seo.title;
  const shareDescription = description || seo.description;
  const shareImage = image ?? seo.image;
  const images = shareImage
    ? [
        {
          url: shareImage.url,
          alt: shareImage.alt,
          width: shareImage.width,
          height: shareImage.height,
        },
      ]
    : undefined;

  return {
    ...(title ? { title } : {}),
    description: shareDescription,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName,
      locale: "en_US",
      url: path,
      title: shareTitle,
      description: shareDescription,
      images,
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: shareTitle,
      description: shareDescription,
      images: images?.map((i) => i.url),
    },
  };
}
