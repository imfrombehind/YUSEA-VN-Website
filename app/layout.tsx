import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
import { Header } from "@/components/layout/Header";
import { Footer, type FooterColumn } from "@/components/layout/Footer";
import { getAboutPage, getIndexPage, getSiteSettings } from "@/lib/cms";
import { aboutSections, PROJECTS_PATH, PUBLICATIONS_PATH, WORK_PATH } from "@/lib/routes";
import { defaultShareImage, shareImages, siteUrl } from "@/lib/seo";
import "./fonts.css";
import "./globals.css";

/**
 * The whole site is set in Inter Tight, self-hosted from public/fonts (see
 * app/fonts.css). Body text (400) and headings (800) are on every page, so
 * those two files are preloaded.
 */
const PRELOAD_FONTS = [
  "/fonts/inter-tight-latin-400-normal.woff2",
  "/fonts/inter-tight-latin-800-normal.woff2",
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
  const [settings, about, work] = await Promise.all([
    getSiteSettings(),
    getAboutPage(),
    getIndexPage("/work"),
  ]);
  // Footer columns: the About sections, then the /work page with its two
  // lists. Every label comes from WordPress.
  const footerColumns: FooterColumn[] = [
    {
      heading: {
        label: settings.navigation.find((item) => item.href === "/about")?.label || about?.page.title || "",
        href: "/about",
      },
      links: aboutSections(about).map((s) => ({ label: s.label, href: `/about#${s.id}` })),
    },
    {
      heading: { label: work.heading, href: WORK_PATH },
      links: [
        { label: work.sections.viewAllProjects, href: PROJECTS_PATH },
        { label: work.sections.viewAllPublications, href: PUBLICATIONS_PATH },
        // The annual report PDF; hidden until a file is uploaded.
        ...(settings.annualReport.href ? [settings.annualReport] : []),
      ],
    },
  ];
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
          columns={footerColumns}
          social={settings.social}
        />
      </body>
    </html>
  );
}
