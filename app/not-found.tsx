import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSiteSettings } from "@/lib/cms";

/**
 * Branded 404, inside the normal header and footer. Copy comes from the ACF
 * options page like everything else. Next adds noindex to 404s itself.
 * not-found cannot export metadata, so the tab shows the default site title.
 */
export default async function NotFound() {
  const { notFound } = await getSiteSettings();

  return (
    <section className="bg-paper py-section lg:py-section-lg">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading
          as="h1"
          title={notFound.heading}
          body={notFound.body}
        />
        <ArrowLink href={notFound.cta.href} className="mt-10 text-ink">
          {notFound.cta.label}
        </ArrowLink>
      </div>
    </section>
  );
}
