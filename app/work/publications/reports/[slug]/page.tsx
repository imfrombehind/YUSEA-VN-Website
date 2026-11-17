import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PillarTags } from "@/components/work/PillarTags";
import { Prose } from "@/components/work/Prose";
import { getReportBySlug, getReports, getSiteSettings } from "@/lib/cms";
import { formatDate } from "@/lib/format";
import { publicationHref } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { BUTTON_BASE } from "@/components/ui/Button";
import { MetaLine } from "@/components/ui/MetaLine";

/** /api/revalidate can purge "reports" or just "report:<slug>". */
export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const reports = await getReports();
  return reports.map((report) => ({ slug: report.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const report = await getReportBySlug((await params).slug);
  if (!report) return {};
  return pageMetadata({
    title: report.title,
    description: report.excerpt,
    path: publicationHref(report),
    image: report.image,
    type: "article",
    publishedTime: report.date,
  });
}

/** Single report: summary body from WordPress, plus the full file to download. */
export default async function ReportPage({ params }: Props) {
  const [report, { work }] = await Promise.all([
    getReportBySlug((await params).slug),
    getSiteSettings(),
  ]);
  if (!report) notFound();

  return (
    <article className="bg-paper py-section lg:py-section-lg">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <MetaLine
          className="font-display text-base tracking-tight text-muted"
          items={[
            work.kind.report ? <span className="text-ink">{work.kind.report}</span> : null,
            <time key="date" dateTime={report.date}>{formatDate(report.date)}</time>,
          ]}
        />
        <h1 className="mt-4 break-words text-ink">
          {report.title}
        </h1>
        {report.excerpt ? (
          <p className="mt-6 text-2xl leading-snug font-light tracking-[-0.02em] text-muted">{report.excerpt}</p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          {report.fileUrl && work.downloadReport ? (
            <a
              href={report.fileUrl}
              download
              className={`${BUTTON_BASE} bg-ink text-white hover:bg-black`}
            >
              {work.downloadReport}
              <span aria-hidden="true">&darr;</span>
            </a>
          ) : null}
          <PillarTags pillars={report.pillars} />
        </div>

        {report.image ? (
          <div className="relative mt-12 aspect-[3/2] overflow-hidden bg-slate-100">
            <Image
              src={report.image.url}
              alt={report.image.alt}
              fill
              preload
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        ) : null}

        <Prose html={report.content} className="mt-12" />
      </div>
    </article>
  );
}
