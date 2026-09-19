/**
 * WPGraphQL response -> domain type.
 *
 * This is the only file that should need editing once the real schema is
 * live. If ACF field names end up differing from lib/cms/queries.ts, fix
 * them here and in queries.ts; nothing in /components or /app should change.
 */

import type { Homepage, Media, Project, SiteSettings } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

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

export function mapHomepage(data: any): Homepage {
  const f = data?.page?.homepageFields ?? {};
  return {
    hero: {
      headline: f.hero?.headline ?? "",
      subheadline: f.hero?.subheadline ?? "",
      cta: { label: f.hero?.ctaLabel ?? "", href: f.hero?.ctaHref ?? "#" },
      background: mapMedia(f.hero?.background?.node) ?? EMPTY_MEDIA,
    },
    statsBand: {
      heading: f.statsBand?.heading ?? "",
      intro: f.statsBand?.intro ?? undefined,
      stats: f.statsBand?.stats ?? [],
    },
    missionGrid: {
      heading: f.missionGrid?.heading ?? "",
      body: f.missionGrid?.body ?? "",
      points: f.missionGrid?.points ?? [],
    },
    projects: {
      heading: f.projects?.heading ?? "",
      body: f.projects?.body ?? "",
      cta: { label: f.projects?.ctaLabel ?? "", href: f.projects?.ctaHref ?? "#" },
    },
    partners: {
      heading: f.partners?.heading ?? "",
      body: f.partners?.body ?? "",
      cta: {
        label: f.partners?.ctaLabel ?? "",
        href: f.partners?.ctaHref ?? "#",
      },
      image: mapMedia(f.partners?.image?.node) ?? EMPTY_MEDIA,
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
      title: n.title ?? "",
      // WP returns excerpts wrapped in markup.
      excerpt: (n.excerpt ?? "").replace(/<[^>]+>/g, "").trim(),
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

export function mapSiteSettings(data: any): SiteSettings {
  const s = data?.siteSettings ?? {};
  return {
    siteName: s.siteName ?? "YUSEA",
    navigation: s.navigation ?? [],
    footerLinks: s.footerLinks ?? [],
    social: s.social ?? [],
    partners: (s.partners ?? []).map((p: any) => ({
      name: p.name,
      tier: p.tier ?? "partner",
      href: p.href ?? undefined,
      logo: mapMedia(p.logo?.node),
    })),
  };
}
