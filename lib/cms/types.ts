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

/** A taxonomy term, as attached to a project or publication. */
export type Term = {
  slug: string;
  name: string;
};

/**
 * `pillar` taxonomy — the three core focus areas. Shared by Projects,
 * Reports and Posts, so one slug filters all of them on /work.
 */
export type Pillar = Term & {
  description: string;
  /** ACF on the term: the Our Focus card image. */
  image?: Media;
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
  pillars: Term[];
  status: "active" | "completed" | "planned";
};

/** A single project with its body. `content` is WordPress-rendered HTML. */
export type ProjectDetail = Project & {
  content: string;
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

/**
 * Publications: standard WP posts (kind "blog") and the `Report` CPT
 * (kind "report"). Both list together on /work and /work/publications.
 */
export type Publication = {
  kind: "blog" | "report";
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  /** First category name, shown in the card eyebrow. */
  topic?: string;
  image?: Media;
  pillars: Term[];
};

/** A blog post. */
export type Post = Publication & { kind: "blog" };

/** A `Report` CPT entry. */
export type Report = Publication & { kind: "report" };

/** A single post with its body. `content` is WordPress-rendered HTML. */
export type PostDetail = Post & {
  content: string;
};

/** A single report with its body and optional downloadable file. */
export type ReportDetail = Report & {
  content: string;
  /** ACF file field: the full report, usually a PDF. */
  fileUrl?: string;
};

/** A standard WP page (e.g. /about): title, body, featured image. */
export type PageDetail = {
  title: string;
  excerpt: string;
  content: string;
  image?: Media;
  /** ACF `indexPageFields` — on the Work, Projects and Publications pages. */
  eyebrow: string;
  /** ACF `workHubFields` — on the Work page only; "" elsewhere. */
  workHub: WorkHubSections;
};

/** The two section headings and "view all" links on /work. */
export type WorkHubSections = {
  projectsHeading: string;
  publicationsHeading: string;
  viewAllProjects: string;
  viewAllPublications: string;
};

/**
 * Copy for a /work index page. Comes from its WP page (title = heading,
 * excerpt = intro), falling back to the Site Settings `work` group.
 */
export type IndexPage = IndexCopy & {
  sections: WorkHubSections;
};

/** One social profile link, in the header and footer. */
export type SocialLink = {
  /** e.g. "LinkedIn" — the accessible name, and picks the built-in icon. */
  platform: string;
  href: string;
  /** Optional uploaded icon; replaces the built-in one. */
  icon?: Media;
};

/** A header nav item. Items with categories or quick links get a dropdown. */
export type NavItem = CTA & {
  categories: CTA[];
  quickLinks: CTA[];
  /** Column headings in this item's dropdown, e.g. "By focus" / "Quick links". */
  categoriesHeading: string;
  quickLinksHeading: string;
};

/** Heading, intro and eyebrow for one of the /work index pages. */
export type IndexCopy = {
  eyebrow: string;
  heading: string;
  intro: string;
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
  /** Copy for /work, its two indexes and the single templates. */
  work: {
    hub: IndexCopy;
    projects: IndexCopy;
    publications: IndexCopy;
    /** aria-label for the pillar / type filter row. */
    filterLabel: string;
    /** The "no filter" chip. */
    filterAll: string;
    projectsHeading: string;
    publicationsHeading: string;
    viewAllProjects: string;
    viewAllPublications: string;
    emptyText: string;
    kind: Record<Publication["kind"], string>;
    status: Record<Project["status"], string>;
    /** Single project: heading over the metrics column. */
    metricsHeading: string;
    /** Single report: the file download button. */
    downloadReport: string;
  };
  navigation: NavItem[];
  footerLinks: CTA[];
  social: SocialLink[];
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
    /** ACF WYSIWYG — an HTML string (paragraphs, bullet lists). */
    intro?: string;
    stats: Stat[];
  };
  /** Our Focus — copy from ACF, the cards from the `pillar` taxonomy. */
  ourFocus: {
    heading: string;
    /** "Discover all our initiatives" → /work */
    cta: CTA;
    /** "Explore more" on each card. */
    linkLabel: string;
    pillars: Pillar[];
  };
};
