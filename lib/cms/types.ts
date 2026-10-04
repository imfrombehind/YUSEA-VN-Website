/**
 * Content model — mirrors the ACF / CPT UI structure described in the
 * project spec (§2). These types are the contract between the frontend
 * and WordPress: the components only ever see these shapes, never raw
 * WPGraphQL responses. When the API lands, only `mappers.ts` changes.
 */

export type CTA = {
  label: string;
  href: string;
};

export type Media = {
  url: string;
  alt: string;
  /** WP exposes these; used for next/image sizing where available. */
  width?: number;
  height?: number;
};

/** A single large data point in the §5 "data grid" sections. */
export type Stat = {
  /** The emphasised figure, e.g. "38%" — rendered at display scale. */
  value: string;
  /** The clause that completes it, e.g. "of Viet Nam lives in cities". */
  description: string;
  /** Optional provenance, shown small beneath the stat. */
  source?: string;
};

/** `Projects` CPT — case studies of regional transformations. */
export type Project = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** ACF: geographic coordinates. */
  latitude: number;
  longitude: number;
  city: string;
  province: string;
  /** ACF: impact metrics. */
  metrics: Stat[];
  heroImage?: Media;
  topics: string[];
  status: "active" | "completed" | "planned";
};

/** `Events` CPT — upcoming initiatives and gatherings. */
export type YuseaEvent = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  startDate: string;
  endDate?: string;
  location: string;
  image?: Media;
};

/** `Topics / Blog` — standard post architecture. */
export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  topic?: string;
  image?: Media;
};

/** A single post with its body. `content` is WordPress-rendered HTML. */
export type PostDetail = Post & {
  content: string;
};

export type Partner = {
  name: string;
  logo?: Media;
  href?: string;
  /**
   * The reference site groups logos into tiers rather than one flat
   * grid, and the tier carries real meaning about the relationship.
   */
  tier: "funder" | "lead" | "partner";
};

/**
 * Global ACF Options Page ("Site Settings") — every string that appears on
 * every page: header, footer, metadata, shared labels.
 */
export type SiteSettings = {
  siteName: string;
  /** Header + footer logo. If unset, the site name renders as a wordmark. */
  logo?: Media;
  /** Browser tab icon (square PNG, 512×512 recommended). */
  favicon?: Media;
  seo: {
    /** Default <title>, e.g. "YUSEA — Regional development in Viet Nam". */
    title: string;
    description: string;
    /** Default social share image (1200×630). Pages with their own image override it. */
    image?: Media;
  };
  /** Copy for the 404 page. */
  notFound: {
    eyebrow: string;
    heading: string;
    body: string;
    cta: CTA;
  };
  labels: {
    skipToContent: string;
    menuOpen: string;
    menuClose: string;
  };
  footer: {
    /** `{year}` is replaced with the current year. */
    copyright: string;
    address: string;
  };
  /** Copy for the /blog index. */
  blog: {
    eyebrow: string;
    heading: string;
    intro: string;
    emptyText: string;
  };
  navigation: CTA[];
  footerLinks: CTA[];
  social: { platform: string; href: string }[];
  partners: Partner[];
};

/** Everything the homepage renders, in section order. */
export type Homepage = {
  hero: {
    headline: string;
    subheadline: string;
    cta: CTA;
    background: Media;
  };
  /** §5 #homepage-section-1 */
  statsBand: {
    eyebrow: string;
    heading: string;
    intro?: string;
    stats: Stat[];
  };
  /** §5 #homepage-section-2 */
  missionGrid: {
    eyebrow: string;
    heading: string;
    body: string;
    points: { title: string; body: string }[];
  };
  /** §5 #homepage-section-3 */
  projects: {
    eyebrow: string;
    heading: string;
    body: string;
    cta: CTA;
    map: MapLabels;
  };
  /** #homepage-latest-posts — copy from ACF, posts from the same query. */
  latestPosts: {
    eyebrow: string;
    heading: string;
    cta: CTA;
    posts: Post[];
  };
  /** §5 #homepage-section-4 */
  partners: {
    eyebrow: string;
    heading: string;
    body: string;
    cta: CTA;
    image: Media;
    tierLabels: Record<Partner["tier"], string>;
  };
};

/** Every string the client-side map renders. */
export type MapLabels = {
  errorText: string;
  /** `{count}` is replaced, e.g. "{count} project" / "{count} projects". */
  countOne: string;
  countOther: string;
  status: Record<Project["status"], string>;
};
