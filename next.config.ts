import type { NextConfig } from "next";

/**
 * next/image needs the WordPress media host allow-listed before it will
 * optimise uploads. Derived from WORDPRESS_GRAPHQL_URL so there is only one
 * place to configure the CMS host.
 */
function wordpressImagePattern() {
  const endpoint = process.env.WORDPRESS_GRAPHQL_URL;
  if (!endpoint) return [];

  try {
    const { protocol, hostname } = new URL(endpoint);
    return [
      {
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        pathname: "/wp-content/uploads/**",
      },
    ];
  } catch {
    console.warn("[next.config] WORDPRESS_GRAPHQL_URL is not a valid URL.");
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: wordpressImagePattern(),
  },
};

export default nextConfig;
