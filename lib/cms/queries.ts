/**
 * WPGraphQL documents, written against the content model in the spec (§2).
 *
 * These are intentionally committed *before* the CMS exists so the field
 * names here can act as the build spec for ACF: if you name the ACF field
 * groups to match, these queries work on the first try. The mock responses in
 * lib/cms/mocks mirror these documents exactly.
 *
 * ACF field groups (WPGraphQL for ACF exposes them by "GraphQL Field Name"):
 *   Page "/"      -> homepageFields     { hero statsBand ourFocus }
 *   Project CPT   -> projectFields      { latitude longitude city province status metrics heroImage }
 *   Report CPT    -> reportFields       { file }
 *   Pillar term   -> pillarFields       { image }
 *   Index pages   -> indexPageFields    { eyebrow }   (Work, Projects, Publications)
 *   Work page     -> workHubFields      { projectsHeading … }
 *   Options page  -> siteSettings { siteSettingsFields { ... } }
 *
 * The `pillar` taxonomy is attached to Projects, Reports and Posts.
 */

const MEDIA_FRAGMENT = /* GraphQL */ `
  fragment MediaFields on MediaItem {
    sourceUrl
    altText
    mediaDetails {
      width
      height
    }
  }
`;

/** Slug + name of every pillar on a node. */
const PILLAR_TERMS = /* GraphQL */ `
  pillars {
    nodes {
      slug
      name
    }
  }
`;

/** Everything a post card needs. Shared by /work and /work/publications. */
const POST_CARD_FRAGMENT = /* GraphQL */ `
  fragment PostCardFields on Post {
    id
    slug
    title
    excerpt
    date
    featuredImage {
      node {
        ...MediaFields
      }
    }
    categories(first: 1) {
      nodes {
        name
      }
    }
    ${PILLAR_TERMS}
  }
`;

const REPORT_CARD_FRAGMENT = /* GraphQL */ `
  fragment ReportCardFields on Report {
    id
    slug
    title
    excerpt
    date
    featuredImage {
      node {
        ...MediaFields
      }
    }
    ${PILLAR_TERMS}
  }
`;

const PROJECT_CARD_FRAGMENT = /* GraphQL */ `
  fragment ProjectCardFields on Project {
    id
    slug
    title
    excerpt
    projectFields {
      latitude
      longitude
      city
      province
      status
      metrics {
        value
        description
        source
      }
      heroImage {
        node {
          ...MediaFields
        }
      }
    }
    ${PILLAR_TERMS}
  }
`;

/**
 * Pillar terms in their WP admin order. TERM_ORDER needs a term-ordering
 * plugin to be editable; without one it falls back to creation order.
 */
const PILLARS_CONNECTION = /* GraphQL */ `
  pillars(first: $pillarsFirst, where: { orderby: TERM_ORDER, hideEmpty: false }) {
    nodes {
      slug
      name
      description
      pillarFields {
        image {
          node {
            ...MediaFields
          }
        }
      }
    }
  }
`;

/**
 * The whole homepage in one round trip: the page's ACF fields (aliased to
 * `pageData`) and the three pillars for Our Focus. Site-wide strings
 * (header, footer) live on the options page and come from
 * SITE_SETTINGS_QUERY via the layout.
 *
 * `page(id: "/", idType: URI)` resolves the page set as the static front
 * page under Settings → Reading.
 */
export const HOMEPAGE_QUERY = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  query Homepage($pillarsFirst: Int = 3) {
    pageData: page(id: "/", idType: URI) {
      homepageFields {
        hero {
          headline
          subheadline
          ctaLabel
          ctaHref
          background {
            node {
              ...MediaFields
            }
          }
        }
        statsBand {
          eyebrow
          heading
          intro
          stats {
            value
            description
            source
          }
        }
        ourFocus {
          heading
          ctaLabel
          ctaHref
          linkLabel
        }
      }
    }
    ${PILLARS_CONNECTION}
  }
`;

/** Every pillar, for the filter row on /work. */
export const PILLARS_QUERY = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  query Pillars($pillarsFirst: Int = 20) {
    ${PILLARS_CONNECTION}
  }
`;

export const PROJECTS_QUERY = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  ${PROJECT_CARD_FRAGMENT}
  query Projects($first: Int = 100) {
    projects(first: $first, where: { status: PUBLISH }) {
      nodes {
        ...ProjectCardFields
      }
    }
  }
`;

export const PROJECT_BY_SLUG_QUERY = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  ${PROJECT_CARD_FRAGMENT}
  query ProjectBySlug($slug: ID!) {
    project(id: $slug, idType: SLUG) {
      ...ProjectCardFields
      content
    }
  }
`;

export const REPORTS_QUERY = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  ${REPORT_CARD_FRAGMENT}
  query Reports($first: Int = 100) {
    reports(first: $first, where: { status: PUBLISH }) {
      nodes {
        ...ReportCardFields
      }
    }
  }
`;

export const REPORT_BY_SLUG_QUERY = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  ${REPORT_CARD_FRAGMENT}
  query ReportBySlug($slug: ID!) {
    report(id: $slug, idType: SLUG) {
      ...ReportCardFields
      content
      reportFields {
        file {
          node {
            mediaItemUrl
          }
        }
      }
    }
  }
`;

/** Standard WP posts, plus the pillar taxonomy. */
export const POSTS_QUERY = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  ${POST_CARD_FRAGMENT}
  query Posts($first: Int = 24) {
    posts(first: $first, where: { status: PUBLISH }) {
      nodes {
        ...PostCardFields
      }
    }
  }
`;

export const POST_BY_SLUG_QUERY = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  ${POST_CARD_FRAGMENT}
  query PostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      ...PostCardFields
      content
    }
  }
`;

/** A standard WP page by its path, e.g. "/about". */
export const PAGE_BY_URI_QUERY = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  query PageByUri($uri: ID!) {
    page(id: $uri, idType: URI) {
      title
      excerpt
      content
      featuredImage {
        node {
          ...MediaFields
        }
      }
      indexPageFields {
        eyebrow
      }
      workHubFields {
        projectsHeading
        publicationsHeading
        viewAllProjectsLabel
        viewAllPublicationsLabel
      }
    }
  }
`;

/**
 * ACF options page. WPGraphQL for ACF nests each assigned field group under
 * the page's root field, hence siteSettings → siteSettingsFields.
 */
export const SITE_SETTINGS_QUERY = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  query SiteSettings {
    siteSettings {
      siteSettingsFields {
        siteName
        logo {
          node {
            ...MediaFields
          }
        }
        favicon {
          node {
            ...MediaFields
          }
        }
        seoTitle
        seoDescription
        seoImage {
          node {
            ...MediaFields
          }
        }
        notFoundEyebrow
        notFoundHeading
        notFoundBody
        notFoundCtaLabel
        notFoundCtaHref
        skipToContentLabel
        menuOpenLabel
        menuCloseLabel
        footerCopyright
        footerAddress
        work {
          hubEyebrow
          hubHeading
          hubIntro
          projectsEyebrow
          projectsHeading
          projectsIntro
          publicationsEyebrow
          publicationsHeading
          publicationsIntro
          filterLabel
          filterAllLabel
          projectsSectionHeading
          publicationsSectionHeading
          viewAllProjectsLabel
          viewAllPublicationsLabel
          emptyText
          kindBlogLabel
          kindReportLabel
          statusActiveLabel
          statusCompletedLabel
          statusPlannedLabel
          metricsHeading
          downloadReportLabel
        }
        navigation {
          label
          href
          categoriesHeading
          quickLinksHeading
          categories {
            label
            href
          }
          quickLinks {
            label
            href
          }
        }
        footerLinks {
          label
          href
        }
        social {
          platform
          href
          icon {
            node {
              ...MediaFields
            }
          }
        }
      }
    }
  }
`;
