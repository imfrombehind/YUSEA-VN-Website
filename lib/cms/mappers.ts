/**
 * WPGraphQL response -> domain type.
 *
 * This is the only file that should need editing once the real schema is
 * live. If ACF field names end up differing from lib/cms/queries.ts, fix
 * them here and in queries.ts; nothing in /components or /app should change.
 */

import type {
  CTA,
  Homepage,
  Media,
  Post,
  PostDetail,
  Project,
  SiteSettings,
} from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

/**
 * WP renders titles and excerpts through wptexturize, so they arrive as
 * entities (&#8217;, &hellip;). React would print those literally.
 */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n =
        code[1] === "x" || code[1] === "X"
          ? parseInt(code.slice(2), 16)
          : parseInt(code.slice(1), 10);
      return Number.isNaN(n) ? match : String.fromCodePoint(n);
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** WP returns excerpts wrapped in markup. */
function plainText(html: string | null | undefined): string {
  return decodeEntities((html ?? "").replace(/<[^>]+>/g, "")).trim();
}

export function mapMedia(node: any): Media | undefined {
  if (!node?.sourceUrl) return undefined;
  return {
    url: node.sourceUrl,
    alt: node.altText ?? "",
    width: node.mediaDetails?.width,
    height: node.mediaDetails?.height,
  };
}

const EMPTY_MEDIA: Media = { url: "", alt: "" };

/** ACF stores a CTA as a ctaLabel + ctaHref pair on its group. */
function mapCta(group: any): CTA {
  return { label: group?.ctaLabel ?? "", href: group?.ctaHref ?? "#" };
}

/**
 * ACF repeater rows of { label, href } (nav, footer links). Rows with no
 * label are dropped, so a half-filled row in WP admin never renders.
 */
function mapLinks(rows: any): CTA[] {
  return (rows ?? [])
    .filter((r: any) => r?.label)
    .map((r: any): CTA => ({ label: r.label, href: r.href || "#" }));
}

/**
 * HOMEPAGE_QUERY → Homepage. Empty ACF fields become "" rather than
 * fallback copy, so nothing on the page is ever written in code.
 */
export function mapHomepage(data: any): Homepage {
  const f = data?.pageData?.homepageFields ?? {};
  return {
    hero: {
      headline: f.hero?.headline ?? "",
      subheadline: f.hero?.subheadline ?? "",
      cta: mapCta(f.hero),
      background: mapMedia(f.hero?.background?.node) ?? EMPTY_MEDIA,
    },
    statsBand: {
      eyebrow: f.statsBand?.eyebrow ?? "",
      heading: f.statsBand?.heading ?? "",
      intro: f.statsBand?.intro ?? undefined,
      stats: f.statsBand?.stats ?? [],
    },
    missionGrid: {
      eyebrow: f.missionGrid?.eyebrow ?? "",
      heading: f.missionGrid?.heading ?? "",
      body: f.missionGrid?.body ?? "",
      points: f.missionGrid?.points ?? [],
    },
    projects: {
      eyebrow: f.projects?.eyebrow ?? "",
      heading: f.projects?.heading ?? "",
      body: f.projects?.body ?? "",
      cta: mapCta(f.projects),
      map: {
        errorText: f.projects?.mapErrorText ?? "",
        countOne: f.projects?.mapCountOne ?? "{count}",
        countOther: f.projects?.mapCountOther ?? "{count}",
        status: {
          active: f.projects?.statusActive ?? "",
          completed: f.projects?.statusCompleted ?? "",
          planned: f.projects?.statusPlanned ?? "",
        },
      },
    },
    latestPosts: {
      eyebrow: f.latestPosts?.eyebrow ?? "",
      heading: f.latestPosts?.heading ?? "",
      cta: mapCta(f.latestPosts),
      posts: mapPosts(data),
    },
    partners: {
      eyebrow: f.partners?.eyebrow ?? "",
      heading: f.partners?.heading ?? "",
      body: f.partners?.body ?? "",
      cta: mapCta(f.partners),
      image: mapMedia(f.partners?.image?.node) ?? EMPTY_MEDIA,
      tierLabels: {
        funder: f.partners?.funderLabel ?? "",
        lead: f.partners?.leadLabel ?? "",
        partner: f.partners?.partnerLabel ?? "",
      },
    },
  };
}

export function mapProjects(data: any): Project[] {
  const nodes = data?.projects?.nodes ?? [];
  return nodes.map((n: any): Project => {
    const p = n.projectFields ?? {};
    return {
      id: n.id,
      slug: n.slug,
      title: decodeEntities(n.title ?? ""),
      excerpt: plainText(n.excerpt),
      latitude: Number(p.latitude),
      longitude: Number(p.longitude),
      city: p.city ?? "",
      province: p.province ?? "",
      metrics: p.metrics ?? [],
      heroImage: mapMedia(p.heroImage?.node),
      topics: (n.topics?.nodes ?? []).map((t: any) => t.name),
      status: p.status ?? "active",
    };
  });
}

function mapPost(n: any): Post {
  return {
    id: n.id,
    slug: n.slug,
    title: decodeEntities(n.title ?? ""),
    excerpt: plainText(n.excerpt),
    date: n.date ?? "",
    topic: n.categories?.nodes?.[0]?.name ?? undefined,
    image: mapMedia(n.featuredImage?.node),
  };
}

export function mapPosts(data: any): Post[] {
  return (data?.posts?.nodes ?? []).map(mapPost);
}

export function mapPostDetail(data: any): PostDetail | null {
  if (!data?.post) return null;
  return { ...mapPost(data.post), content: data.post.content ?? "" };
}

/** SITE_SETTINGS_QUERY → SiteSettings. Fields sit one level down, in the group. */
export function mapSiteSettings(data: any): SiteSettings {
  const s = data?.siteSettings?.siteSettingsFields ?? {};
  return {
    siteName: s.siteName ?? "",
    logo: mapMedia(s.logo?.node),
    favicon: mapMedia(s.favicon?.node),
    seo: {
      title: s.seoTitle ?? "",
      description: s.seoDescription ?? "",
      image: mapMedia(s.seoImage?.node),
    },
    notFound: {
      eyebrow: s.notFoundEyebrow ?? "",
      heading: s.notFoundHeading ?? "",
      body: s.notFoundBody ?? "",
      cta: { label: s.notFoundCtaLabel ?? "", href: s.notFoundCtaHref || "/" },
    },
    labels: {
      skipToContent: s.skipToContentLabel ?? "",
      menuOpen: s.menuOpenLabel ?? "",
      menuClose: s.menuCloseLabel ?? "",
    },
    footer: {
      copyright: s.footerCopyright ?? "",
      address: s.footerAddress ?? "",
    },
    blog: {
      eyebrow: s.blogEyebrow ?? "",
      heading: s.blogHeading ?? "",
      intro: s.blogIntro ?? "",
      emptyText: s.blogEmptyText ?? "",
    },
    navigation: mapLinks(s.navigation),
    footerLinks: mapLinks(s.footerLinks),
    social: s.social ?? [],
    partners: (s.partners ?? []).map((p: any) => ({
      name: p.name,
      tier: p.tier ?? "partner",
      href: p.href ?? undefined,
      logo: mapMedia(p.logo?.node),
    })),
  };
}
