/**
 * WPGraphQL response -> domain type.
 *
 * This is the only file that should need editing once the real schema is
 * live. If ACF field names end up differing from lib/cms/queries.ts, fix
 * them here and in queries.ts; nothing in /components or /app should change.
 */

import type {
  AboutPage,
  BoardMember,
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
  SocialLink,
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

/** The gallery if it has photos, otherwise the single background image. */
function mapHeroSlides(hero: any): Media[] {
  const gallery = (hero?.backgrounds?.nodes ?? [])
    .map(mapMedia)
    .filter((m: Media | undefined): m is Media => Boolean(m));
  if (gallery.length > 0) return gallery;
  const single = mapMedia(hero?.background?.node);
  return single ? [single] : [];
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Typed bullets: "•", or "-" / "*" followed by a space. */
const BULLET = /^(?:•\s*|[-*]\s+)(.+)$/;

/**
 * Editors often type bullets by hand instead of using the list button.
 * Plain text (a textarea) becomes paragraphs, and bullet lines become a
 * list; in HTML (a WYSIWYG, where each line is its own <p>), runs of
 * bullet paragraphs become a list. Anything else passes through untouched.
 */
export function textToHtml(text: string): string {
  if (/<[a-z][^>]*>/i.test(text)) {
    return text.replace(/(?:<p>\s*(?:•\s*|[-*]\s+)[\s\S]*?<\/p>\s*)+/g, (run) => {
      const items = [...run.matchAll(/<p>\s*(?:•\s*|[-*]\s+)([\s\S]*?)<\/p>/g)].map(
        (m) => `<li>${m[1].trim()}</li>`,
      );
      return `<ul>${items.join("")}</ul>\n`;
    });
  }

  const html: string[] = [];
  let items: string[] = [];
  const flush = () => {
    if (items.length) html.push(`<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`);
    items = [];
  };

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const bullet = line.match(BULLET);
    if (bullet) {
      items.push(escapeHtml(bullet[1]));
    } else {
      flush();
      html.push(`<p>${escapeHtml(line)}</p>`);
    }
  }
  flush();
  return html.join("\n");
}

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
        categoriesHeading: r.categoriesHeading ?? "",
        quickLinksHeading: r.quickLinksHeading ?? "",
      }),
    );
}

/** Social repeater rows. Rows without a link are dropped. */
function mapSocial(rows: any): SocialLink[] {
  return (rows ?? [])
    .filter((r: any) => r?.href)
    .map(
      (r: any): SocialLink => ({
        platform: r.platform ?? "",
        href: r.href,
        icon: mapMedia(r.icon?.node),
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
      slides: mapHeroSlides(f.hero),
    },
    statsBand: {
      eyebrow: f.statsBand?.eyebrow ?? "",
      heading: f.statsBand?.heading ?? "",
      intro: f.statsBand?.intro ? textToHtml(f.statsBand.intro) : undefined,
      stats: f.statsBand?.stats ?? [],
    },
    ourFocus: {
      eyebrow: f.ourFocus?.eyebrow ?? "",
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
  const page = data?.page;
  if (!page) return null;
  const hub = page.workHubFields ?? {};
  return {
    title: decodeEntities(page.title ?? ""),
    excerpt: plainText(page.excerpt),
    content: page.content ?? "",
    image: mapMedia(page.featuredImage?.node),
    header: {
      eyebrow: page.indexPageFields?.eyebrow ?? "",
      heading: page.indexPageFields?.heading || decodeEntities(page.title ?? ""),
      intro: page.indexPageFields?.intro ?? "",
    },
    workHub: {
      projectsHeading: hub.projectsHeading ?? "",
      publicationsHeading: hub.publicationsHeading ?? "",
      viewAllProjects: hub.viewAllProjectsLabel ?? "",
      viewAllPublications: hub.viewAllPublicationsLabel ?? "",
    },
  };
}

/**
 * ABOUT_PAGE_QUERY → AboutPage, or null if WP has no /about page. Rows
 * without their main text (a point, a member's name, a link label) are
 * dropped, so half-filled rows never render.
 */
export function mapAboutPage(data: any): AboutPage | null {
  const page = mapPageDetail(data);
  if (!page) return null;
  const f = data.page.aboutPageFields ?? {};
  return {
    page,
    mission: {
      heading: f.mission?.heading ?? "",
      points: (f.mission?.points ?? [])
        .map((r: any) => (r?.text ?? "").trim())
        .filter(Boolean),
    },
    focus: {
      heading: f.focus?.heading ?? "",
      intro: f.focus?.intro ?? "",
      linkLabel: f.focus?.linkLabel ?? "",
      pillars: mapPillars(data).slice(0, 3),
    },
    board: {
      heading: f.board?.heading ?? "",
      intro: f.board?.intro ?? "",
      members: (f.board?.members ?? [])
        .filter((r: any) => r?.name)
        .map(
          (r: any): BoardMember => ({
            name: r.name,
            role: r.role ?? "",
            photo: mapMedia(r.photo?.node),
          }),
        ),
    },
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
    },
    footer: {
      copyright: s.footerCopyright ?? "",
      address: s.footerAddress ?? "",
    },
    work: mapWorkCopy(s.work),
    navigation: mapNavigation(s.navigation),
    footerLinks: mapLinks(s.footerLinks),
    social: mapSocial(s.social),
  };
}

/** The options page's `work` group → SiteSettings["work"]. */
function mapWorkCopy(w: any): SiteSettings["work"] {
  return {
    filterLabel: w?.filterLabel ?? "",
    filterAll: w?.filterAllLabel ?? "",
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
