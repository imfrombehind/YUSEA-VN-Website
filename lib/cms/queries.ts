/**
 * WPGraphQL documents, written against the content model in the spec (§2).
 *
 * These are intentionally committed *before* the CMS exists so the field
 * names here can act as the build spec for ACF: if you name the ACF field
 * groups to match, these queries work on the first try.
 *
 * Assumed ACF field group names (WPGraphQL for ACF exposes them camelCased):
 *   Project  -> projectFields { latitude longitude city province status metrics{...} }
 *   Homepage -> homepageFields { hero{...} statsBand{...} ... }
 *   Options  -> siteSettings  { navigation{...} footerLinks{...} partners{...} }
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

export const HOMEPAGE_QUERY = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  query Homepage {
    page(id: "/", idType: URI) {
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
          heading
          intro
          stats {
            value
            description
            source
          }
        }
        missionGrid {
          heading
          body
          points {
            title
            body
          }
        }
        projects {
          heading
          body
          ctaLabel
          ctaHref
        }
        partners {
          heading
          body
          ctaLabel
          ctaHref
          image {
            node {
              ...MediaFields
            }
          }
        }
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

export const SITE_SETTINGS_QUERY = /* GraphQL */ `
  ${MEDIA_FRAGMENT}
  query SiteSettings {
    siteSettings {
      siteName
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
`;
