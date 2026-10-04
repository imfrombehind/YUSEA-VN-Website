/**
 * WPGraphQL documents, written against the content model in the spec (§2).
 *
 * These are intentionally committed *before* the CMS exists so the field
 * names here can act as the build spec for ACF: if you name the ACF field
 * groups to match, these queries work on the first try. The mock responses in
 * lib/cms/mocks mirror these documents exactly.
 *
 * ACF field groups (WPGraphQL for ACF exposes them by "GraphQL Field Name"):
 *   Page "/"      -> homepageFields     { hero statsBand missionGrid projects latestPosts partners }
 *   Project CPT   -> projectFields      { latitude longitude city province status metrics heroImage }
 *   Options page  -> siteSettings { siteSettingsFields { ... } }
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

/** Everything a post card needs. Shared by the homepage and /blog. */
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
  }
`;

/**
 * The whole homepage in one round trip: the page's ACF fields (aliased to
 * `pageData`) and the latest posts. Site-wide strings (header, footer) live
 * on the options page and come from SITE_SETTINGS_QUERY via the layout.
 *
 * `page(id: "/", idType: URI)` resolves the page set as the static front
 * page under Settings → Reading.
 */
export const HOMEPAGE_QUERY = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  ${POST_CARD_FRAGMENT}
  query Homepage($postsFirst: Int = 3) {
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
        missionGrid {
          eyebrow
          heading
          body
          points {
            title
            body
          }
        }
        projects {
          eyebrow
          heading
          body
          ctaLabel
          ctaHref
          mapErrorText
          mapCountOne
          mapCountOther
          statusActive
          statusCompleted
          statusPlanned
        }
        latestPosts {
          eyebrow
          heading
          ctaLabel
          ctaHref
        }
        partners {
          eyebrow
          heading
          body
          ctaLabel
          ctaHref
          funderLabel
          leadLabel
          partnerLabel
          image {
            node {
              ...MediaFields
            }
          }
        }
      }
    }
    posts(first: $postsFirst, where: { status: PUBLISH }) {
      nodes {
        ...PostCardFields
      }
    }
  }
`;

export const PROJECTS_QUERY = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  query Projects($first: Int = 100) {
    projects(first: $first, where: { status: PUBLISH }) {
      nodes {
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
        topics {
          nodes {
            name
          }
        }
      }
    }
  }
`;

/** Standard WP posts — no ACF needed, so this works on a stock install. */
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
        blogEyebrow
        blogHeading
        blogIntro
        blogEmptyText
        navigation {
          label
          href
        }
        footerLinks {
          label
          href
        }
        social {
          platform
          href
        }
        partners {
          name
          tier
          href
          logo {
            node {
              ...MediaFields
            }
          }
        }
      }
    }
  }
`;
