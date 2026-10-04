import type { NextConfig } from "next";

type RemotePattern = NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
>[number];

/** The production CMS. Its media library serves from /wp-content/uploads. */
const CMS_HOST = "cms.yuseavietnam.com";

/**
 * next/image only optimises hosts that are allow-listed here:
 *  - the CMS media library (hard-coded, so Vercel builds work even before
 *    the env var is set)
 *  - whatever host WORDPRESS_GRAPHQL_ENDPOINT points at, if it differs
 *    (e.g. a staging WordPress)
 *  - Unsplash and placehold.co, which serve the images in lib/cms/mocks
 */
function imagePatterns(): RemotePattern[] {
  const patterns: RemotePattern[] = [
    { protocol: "https", hostname: CMS_HOST, pathname: "/wp-content/uploads/**" },
    { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    // Placeholder logo / favicon / partner logos in the site-settings mock.
    { protocol: "https", hostname: "placehold.co", pathname: "/**" },
  ];

  const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!endpoint) return patterns;

  try {
    const { protocol, hostname } = new URL(endpoint);
    if (hostname !== CMS_HOST) {
      patterns.push({
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        pathname: "/wp-content/uploads/**",
      });
    }
  } catch {
    console.warn("[next.config] WORDPRESS_GRAPHQL_ENDPOINT is not a valid URL.");
  }

  return patterns;
}

/**
 * Baseline security headers. Vercel already sends HSTS. A Content-Security-
 * Policy is still to do: it has to allow MapLibre's blob: workers, the CARTO
 * basemap and whatever embeds editors paste into posts, so it needs testing
 * against real CMS content first.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: imagePatterns(),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
