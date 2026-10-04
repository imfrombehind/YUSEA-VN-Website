import { ButtonLink } from "@/components/ui/Button";
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
          eyebrow={notFound.eyebrow}
          title={notFound.heading}
          body={notFound.body}
          accent="coral"
        />
        <div className="mt-10">
          <ButtonLink href={notFound.cta.href} variant="coral">
            {notFound.cta.label}
          </ButtonLink>
        </div>
      </div>
      <div aria-hidden="true" className="mx-auto mt-section grid h-1 max-w-[1400px] grid-cols-4 px-6 lg:px-10">
        <span className="bg-ink" />
        <span className="bg-coral" />
        <span className="bg-blue" />
        <span className="bg-sun" />
      </div>
    </section>
  );
}
