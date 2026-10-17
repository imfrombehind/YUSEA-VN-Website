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
  NavItem,
  PageDetail,
  Pillar,
  Post,
  PostDetail,
  Project,
  ProjectDetail,
  Report,
  ReportDetail,
  SiteSettings,
  Term,
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

/** Header nav rows, each with optional dropdown sub-repeaters. */
function mapNavigation(rows: any): NavItem[] {
  return (rows ?? [])
    .filter((r: any) => r?.label)
    .map(
      (r: any): NavItem => ({
        label: r.label,
        href: r.href || "#",
        categories: mapLinks(r.categories),
        quickLinks: mapLinks(r.quickLinks),
      }),
    );
}

/** `pillars { nodes { slug name } }` on a project, report or post. */
function mapTerms(connection: any): Term[] {
  return (connection?.nodes ?? [])
    .filter((t: any) => t?.slug)
    .map((t: any): Term => ({ slug: t.slug, name: decodeEntities(t.name ?? "") }));
}

export function mapPillars(data: any): Pillar[] {
  return (data?.pillars?.nodes ?? [])
    .filter((t: any) => t?.slug)
    .map(
      (t: any): Pillar => ({
        slug: t.slug,
        name: decodeEntities(t.name ?? ""),
        description: decodeEntities(t.description ?? ""),
        image: mapMedia(t.pillarFields?.image?.node),
      }),
    );
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
    ourFocus: {
      heading: f.ourFocus?.heading ?? "",
      cta: mapCta(f.ourFocus),
      linkLabel: f.ourFocus?.linkLabel ?? "",
      // The section is a strict three-column grid of the core pillars.
      pillars: mapPillars(data).slice(0, 3),
    },
  };
}

function mapProject(n: any): Project {
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
    pillars: mapTerms(n.pillars),
    status: p.status ?? "active",
  };
}

export function mapProjects(data: any): Project[] {
  return (data?.projects?.nodes ?? []).map(mapProject);
}

export function mapProjectDetail(data: any): ProjectDetail | null {
  if (!data?.project) return null;
  return { ...mapProject(data.project), content: data.project.content ?? "" };
}

function mapPost(n: any): Post {
  return {
    kind: "blog",
    id: n.id,
    slug: n.slug,
    title: decodeEntities(n.title ?? ""),
    excerpt: plainText(n.excerpt),
    date: n.date ?? "",
    topic: n.categories?.nodes?.[0]?.name ?? undefined,
    image: mapMedia(n.featuredImage?.node),
    pillars: mapTerms(n.pillars),
  };
}

export function mapPosts(data: any): Post[] {
  return (data?.posts?.nodes ?? []).map(mapPost);
}

export function mapPostDetail(data: any): PostDetail | null {
  if (!data?.post) return null;
  return { ...mapPost(data.post), content: data.post.content ?? "" };
}

function mapReport(n: any): Report {
  return {
    kind: "report",
    id: n.id,
    slug: n.slug,
    title: decodeEntities(n.title ?? ""),
    excerpt: plainText(n.excerpt),
    date: n.date ?? "",
    image: mapMedia(n.featuredImage?.node),
    pillars: mapTerms(n.pillars),
  };
}

export function mapReports(data: any): Report[] {
  return (data?.reports?.nodes ?? []).map(mapReport);
}

export function mapReportDetail(data: any): ReportDetail | null {
  if (!data?.report) return null;
  return {
    ...mapReport(data.report),
    content: data.report.content ?? "",
    fileUrl: data.report.reportFields?.file?.node?.mediaItemUrl || undefined,
  };
}

export function mapPageDetail(data: any): PageDetail | null {
  if (!data?.page) return null;
  return {
    title: decodeEntities(data.page.title ?? ""),
    excerpt: plainText(data.page.excerpt),
    content: data.page.content ?? "",
    image: mapMedia(data.page.featuredImage?.node),
  };
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
      navCategories: s.navCategoriesLabel ?? "",
      navQuickLinks: s.navQuickLinksLabel ?? "",
    },
    footer: {
      copyright: s.footerCopyright ?? "",
      address: s.footerAddress ?? "",
    },
    work: mapWorkCopy(s.work),
    navigation: mapNavigation(s.navigation),
    footerLinks: mapLinks(s.footerLinks),
    social: s.social ?? [],
  };
}

/** The options page's `work` group → SiteSettings["work"]. */
function mapWorkCopy(w: any): SiteSettings["work"] {
  return {
    hub: {
      eyebrow: w?.hubEyebrow ?? "",
      heading: w?.hubHeading ?? "",
      intro: w?.hubIntro ?? "",
    },
    projects: {
      eyebrow: w?.projectsEyebrow ?? "",
      heading: w?.projectsHeading ?? "",
      intro: w?.projectsIntro ?? "",
    },
    publications: {
      eyebrow: w?.publicationsEyebrow ?? "",
      heading: w?.publicationsHeading ?? "",
      intro: w?.publicationsIntro ?? "",
    },
    filterLabel: w?.filterLabel ?? "",
    filterAll: w?.filterAllLabel ?? "",
    projectsHeading: w?.projectsSectionHeading ?? "",
    publicationsHeading: w?.publicationsSectionHeading ?? "",
    viewAllProjects: w?.viewAllProjectsLabel ?? "",
    viewAllPublications: w?.viewAllPublicationsLabel ?? "",
    emptyText: w?.emptyText ?? "",
    kind: {
      blog: w?.kindBlogLabel ?? "",
      report: w?.kindReportLabel ?? "",
    },
    status: {
      active: w?.statusActiveLabel ?? "",
      completed: w?.statusCompletedLabel ?? "",
      planned: w?.statusPlannedLabel ?? "",
    },
    metricsHeading: w?.metricsHeading ?? "",
    downloadReport: w?.downloadReportLabel ?? "",
  };
}
