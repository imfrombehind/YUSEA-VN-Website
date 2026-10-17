import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PillarTags } from "@/components/work/PillarTags";
import { Prose } from "@/components/work/Prose";
import { getReportBySlug, getReports, getSiteSettings } from "@/lib/cms";
import { formatDate } from "@/lib/format";
import { publicationHref } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

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
        <p className="text-sm text-muted">
          {work.kind.report ? (
            <span className="font-semibold text-blue-700">{work.kind.report} · </span>
          ) : null}
          <time dateTime={report.date}>{formatDate(report.date)}</time>
        </p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight break-words text-ink sm:text-5xl">
          {report.title}
        </h1>
        {report.excerpt ? (
          <p className="mt-6 text-xl leading-relaxed text-muted">{report.excerpt}</p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          {report.fileUrl && work.downloadReport ? (
            <a
              href={report.fileUrl}
              download
              className="inline-flex items-center gap-2 rounded-full border-2 border-blue-600 px-6 py-2.5 font-display text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
            >
              {work.downloadReport}
              <span aria-hidden="true">&darr;</span>
            </a>
          ) : null}
          <PillarTags pillars={report.pillars} />
        </div>

        {report.image ? (
          <div className="relative mt-12 aspect-[3/2] overflow-hidden rounded-2xl bg-slate-100">
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
