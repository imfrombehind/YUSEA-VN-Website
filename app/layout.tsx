import type { Metadata } from "next";
import { Archivo, Barlow } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/cms";
import "./globals.css";

/**
 * The reference site uses Ambit (a commercial TypeMates face) for display
 * type. Archivo is the closest open substitute: same grotesque skeleton,
 * holds up at large uppercase sizes. Swap here if YUSEA licenses Ambit.
 */
const archivo = Archivo({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  variable: "--font-archivo",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "YUSEA — Regional development in Viet Nam",
    template: "%s | YUSEA",
  },
  description:
    "YUSEA works alongside provinces, cities and communities to shape urban growth that is equitable, low-carbon and locally led.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" className={`${archivo.variable} ${barlow.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-sun focus:px-4 focus:py-2 focus:font-display focus:text-sm focus:font-bold focus:uppercase focus:text-navy"
        >
          Skip to content
        </a>

        <Header navigation={settings.navigation} social={settings.social} />
        <main id="main">{children}</main>
        <Footer footerLinks={settings.footerLinks} social={settings.social} />
      </body>
    </html>
  );
}
