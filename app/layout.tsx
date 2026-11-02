import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/cms";
import { defaultShareImage, shareImages, siteUrl } from "@/lib/seo";
import "./fonts.css";
import "./globals.css";

/**
 * The reference site uses Ambit (a commercial TypeMates face) for display
 * type. Archivo is the closest open substitute: same grotesque skeleton,
 * holds up at large uppercase sizes. Swap it in app/fonts.css if YUSEA
 * licenses Ambit. Both fonts are self-hosted from public/fonts; these two
 * files are used on every page, so they are preloaded.
 */
const PRELOAD_FONTS = [
  "/fonts/archivo-latin-800-normal.woff2",
  "/fonts/barlow-latin-400-normal.woff2",
];

/**
 * Site-wide defaults; title, description, share image and favicon all come
 * from the ACF options page. Pages add their canonical URL and Open Graph
 * via pageMetadata() in lib/seo.ts.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const { siteName, seo, favicon } = settings;
  // Pages replace this with pageMetadata(); it covers the rest (e.g. 404s).
  const images = shareImages(defaultShareImage(settings));
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: seo.title, template: `%s | ${siteName}` },
    description: seo.description,
    applicationName: siteName,
    icons: favicon ? { icon: favicon.url, apple: favicon.url } : undefined,
    openGraph: { siteName, title: seo.title, description: seo.description, images },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      images: images?.map((i) => i.url),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  PRELOAD_FONTS.forEach((href) =>
    preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" }),
  );

  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-sun focus:px-4 focus:py-2 focus:font-display focus:text-sm focus:font-bold focus:uppercase focus:text-ink"
        >
          {settings.labels.skipToContent}
        </a>

        <Header
          siteName={settings.siteName}
          logo={settings.logo}
          labels={settings.labels}
          navigation={settings.navigation}
          social={settings.social}
        />
        <main id="main">{children}</main>
        <Footer
          siteName={settings.siteName}
          logo={settings.logo}
          footer={settings.footer}
          footerLinks={settings.footerLinks}
          social={settings.social}
        />
      </body>
    </html>
  );
}
