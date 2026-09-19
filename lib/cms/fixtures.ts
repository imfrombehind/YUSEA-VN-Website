/**
 * Design-time fixtures.
 *
 * These stand in for WordPress until WORDPRESS_GRAPHQL_URL is set. They exist
 * so the layout can be reviewed at realistic copy lengths.
 *
 * ⚠️  ALL FIGURES BELOW ARE PLACEHOLDERS. Every `source` is marked
 *     "PLACEHOLDER" on purpose — it renders visibly in the UI so this data
 *     cannot be shipped by accident. Replace via the CMS, not by editing here.
 */

import type { Homepage, Project, SiteSettings } from "./types";

export const fixtureSiteSettings: SiteSettings = {
  siteName: "YUSEA",
  navigation: [
    { label: "About", href: "/about" },
    { label: "Topics", href: "/topics" },
    { label: "Projects", href: "/projects" },
    { label: "Events", href: "/events" },
    { label: "Resources", href: "/resources" },
  ],
  footerLinks: [
    { label: "About", href: "/about" },
    { label: "Topics", href: "/topics" },
    { label: "Projects", href: "/projects" },
    { label: "Events", href: "/events" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  social: [
    { platform: "LinkedIn", href: "https://www.linkedin.com" },
    { platform: "Facebook", href: "https://www.facebook.com" },
    { platform: "YouTube", href: "https://www.youtube.com" },
  ],
  partners: [
    { name: "Partner One", tier: "funder" },
    { name: "Partner Two", tier: "lead" },
    { name: "Partner Three", tier: "partner" },
    { name: "Partner Four", tier: "partner" },
    { name: "Partner Five", tier: "partner" },
    { name: "Partner Six", tier: "partner" },
  ],
};

export const fixtureHomepage: Homepage = {
  hero: {
    headline: "Building the regions Viet Nam will live in",
    subheadline:
      "YUSEA works alongside provinces, cities and communities to shape urban growth that is equitable, low-carbon and locally led.",
    cta: { label: "Find out more", href: "/about" },
    background: {
      // Replace with an ACF hero image from WordPress.
      url: "",
      alt: "",
    },
  },
  statsBand: {
    heading: "Why regions matter",
    intro:
      "Viet Nam is urbanising faster than almost anywhere in Southeast Asia. The decisions made in the next decade will set the shape of its cities for a century.",
    stats: [
      {
        value: "40%",
        description: "of Viet Nam's population now lives in urban areas",
        source: "PLACEHOLDER — replace via CMS",
      },
      {
        value: "2/3",
        description: "of national GDP is generated in urban centres",
        source: "PLACEHOLDER — replace via CMS",
      },
      {
        value: "1 million",
        description: "people move into Vietnamese cities each year",
        source: "PLACEHOLDER — replace via CMS",
      },
    ],
  },
  missionGrid: {
    heading: "What we do",
    body:
      "We connect provincial leadership, technical expertise and community knowledge so that regional development plans survive contact with the places they describe.",
    points: [
      {
        title: "Integrated planning",
        body:
          "Bringing land use, transport, water and energy decisions into a single planning conversation instead of four separate ones.",
      },
      {
        title: "Climate resilience",
        body:
          "Helping delta and coastal provinces plan for flooding, salinity and heat as design constraints rather than emergencies.",
      },
      {
        title: "Local capacity",
        body:
          "Training the provincial staff who will still be doing this work long after any single programme has closed.",
      },
      {
        title: "Open data",
        body:
          "Publishing the geographic and performance data behind our projects so others can build on it.",
      },
    ],
  },
  projects: {
    heading: "Projects",
    body:
      "From the Mekong Delta to the northern uplands, YUSEA supports regional transformations across Viet Nam. Explore the map to see where we work and what each project is changing on the ground.",
    cta: { label: "See all projects", href: "/projects" },
  },
  partners: {
    heading: "Our funders and partners",
    body:
      "YUSEA is delivered in partnership with national agencies, provincial governments, research institutions and international development organisations.",
    cta: { label: "Learn more", href: "/about/partners" },
    image: { url: "", alt: "" },
  },
};

/**
 * Fixture projects. Coordinates are real Vietnamese cities so the map reads
 * correctly during design review; titles and metrics are placeholders.
 *
 * Note: the map reads from /public/data/projects.csv (spec §5), not from this
 * array. This exists for list views and for the eventual WP-backed pages.
 */
export const fixtureProjects: Project[] = [
  {
    id: "1",
    slug: "can-tho-delta-resilience",
    title: "Can Tho Delta Resilience",
    excerpt:
      "Flood and salinity adaptation planning across the Mekong Delta's largest urban centre.",
    latitude: 10.0452,
    longitude: 105.7469,
    city: "Can Tho",
    province: "Can Tho",
    metrics: [
      {
        value: "12",
        description: "wards covered by the adaptation plan",
        source: "PLACEHOLDER",
      },
    ],
    topics: ["Climate resilience", "Integrated planning"],
    status: "active",
  },
  {
    id: "2",
    slug: "da-nang-coastal-corridor",
    title: "Da Nang Coastal Corridor",
    excerpt:
      "Linking transport investment to coastal protection along the central corridor.",
    latitude: 16.0544,
    longitude: 108.2022,
    city: "Da Nang",
    province: "Da Nang",
    metrics: [
      { value: "31km", description: "of coastline assessed", source: "PLACEHOLDER" },
    ],
    topics: ["Integrated planning"],
    status: "active",
  },
  {
    id: "3",
    slug: "ha-noi-green-neighbourhoods",
    title: "Ha Noi Green Neighbourhoods",
    excerpt:
      "Retrofitting dense inner districts for shade, walkability and stormwater capture.",
    latitude: 21.0278,
    longitude: 105.8342,
    city: "Ha Noi",
    province: "Ha Noi",
    metrics: [
      { value: "4", description: "pilot districts", source: "PLACEHOLDER" },
    ],
    topics: ["Urban biodiversity", "Climate resilience"],
    status: "completed",
  },
];
