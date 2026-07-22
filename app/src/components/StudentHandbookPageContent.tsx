import Link from "next/link";
import type { SiteLocale } from "@/lib/program-pages";
import type { Handbook } from "@/lib/api";

import StudentHandbookView from "@/components/StudentHandbookView";
import { ArrowIcon } from "@/components/icons/ArrowIcon";

const uiByLocale = {
  vi: {
    eyebrow: "Sổ tay sinh viên SIT",
    updatedLabel: "Dành riêng cho sinh viên Khoa Công nghệ Thông tin",
    schoolYearLabel: "Năm học",
    downloadPdf: "Tải bản PDF gốc",
    documentLabel: "Tài liệu",
    documentText: "Xem hoặc tải bản PDF đầy đủ của sổ tay sinh viên.",
    archiveTitle: "Các năm trước",
    emptyContent: "Nội dung đang được cập nhật.",
    linksTitle: "Đi tiếp từ đây",
    links: [
      ["Chương trình đào tạo", "/vi/chuong-trinh-dao-tao"],
      ["Nghiên cứu tại SIT", "/vi/nghien-cuu"],
      ["Hoạt động sinh viên", "/vi/sinh-vien/hoat-dong"],
      ["Việc làm & thực tập", "/vi/sinh-vien/viec-lam"],
    ] as const,
    contactLabel: "Cần hỗ trợ trực tiếp?",
    contactText:
      "Liên hệ Văn phòng Khoa Công nghệ Thông tin để được hướng dẫn đúng đầu mối.",
    handbookPath: "/vi/sinh-vien/so-tay",
  },
  en: {
    eyebrow: "SIT student handbook",
    updatedLabel: "Created for students of the School of Information Technology",
    schoolYearLabel: "Academic year",
    downloadPdf: "Download original PDF",
    documentLabel: "Document",
    documentText: "View or download the full PDF of the student handbook.",
    archiveTitle: "Previous years",
    emptyContent: "Content is being updated.",
    linksTitle: "Continue from here",
    links: [
      ["Academic programmes", "/en/programs"],
      ["Research at SIT", "/en/research"],
      ["Student activities", "/en/students/activities"],
      ["Jobs & internships", "/en/students/jobs"],
    ] as const,
    contactLabel: "Need direct support?",
    contactText:
      "Contact the School of Information Technology office for guidance to the right person or service.",
    handbookPath: "/en/students/handbook",
  },
} as const;

const EMAIL = "sit@ttu.edu.vn";
const PHONE = "+84 272 376 9216";

export default function StudentHandbookPageContent({
  locale,
  edition,
  archive,
}: {
  locale: SiteLocale;
  edition: Handbook;
  archive: Handbook[];
}) {
  const copy = uiByLocale[locale];

  // Fall back to Vietnamese content/PDF when the localized version is missing.
  const content =
    locale === "en" ? edition.contentEn ?? edition.contentVi : edition.contentVi;
  const pdfUrl =
    locale === "en"
      ? edition.pdfUrlEn ?? edition.pdfUrlVi
      : edition.pdfUrlVi;

  const otherYears = archive.filter((h) => h.schoolYear !== edition.schoolYear);

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#171b25]">
      <section className="border-b border-[#171b25]/15 bg-white">
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-10 sm:px-8 lg:pb-20 lg:pt-16">
          <div className="flex items-center gap-4 font-mono text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[#BA4811]">
            <span className="h-px w-12 bg-current" />
            {copy.eyebrow}
          </div>
          <h1 className="mt-7 max-w-[18ch] text-[2.7rem] font-bold leading-[1.04] tracking-[-0.045em] text-balance sm:text-[3.5rem] lg:text-[3.9rem]">
            {copy.eyebrow}
          </h1>
          <p className="mt-6 font-mono text-sm font-semibold uppercase tracking-[0.15em] text-[#626661]">
            {copy.schoolYearLabel}: {edition.schoolYear}
          </p>
        </div>
      </section>

      <section className="relative bg-[#f7f4f1] py-16 sm:py-20 lg:py-24">
        <StudentHandbookView locale={locale} content={content} />
      </section>

      {pdfUrl && (
        <section className="border-b border-[#171b25]/15 bg-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[11rem_minmax(0,1fr)_auto] lg:items-center lg:gap-10">
            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#BA4811]">
              {copy.documentLabel}
            </p>
            <p className="max-w-3xl text-lg font-bold leading-8 tracking-[-0.02em] sm:text-xl">
              {copy.documentText}
            </p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex min-h-12 items-center justify-between gap-8 bg-[#BA4811] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#96380d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
            >
              {copy.downloadPdf}
              <span className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                <ArrowIcon direction="up-right" size={16} />
              </span>
            </a>
          </div>
        </section>
      )}

      {otherYears.length > 0 && (
        <section className="border-y border-[#171b25]/15 bg-[#f7f4f1] py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <h2 className="text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
              {copy.archiveTitle}
            </h2>
            <nav className="mt-7 grid border-t-2 border-[#171b25] sm:grid-cols-2">
              {otherYears.map((h, index) => (
                <Link
                  key={h.schoolYear}
                  href={`${copy.handbookPath}/${h.schoolYear}`}
                  className={`group flex min-h-20 items-center justify-between gap-5 border-b border-[#d8d3ce] px-4 py-5 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#BA4811] ${index % 2 === 0 ? "sm:border-r" : ""}`}
                >
                  <span className="text-sm font-semibold transition-colors group-hover:text-[#BA4811]">
                    {copy.schoolYearLabel} {h.schoolYear}
                  </span>
                  <span
                    aria-hidden
                    className="text-[#BA4811] transition-transform group-hover:translate-x-1"
                  >
                    <ArrowIcon direction="right" size={16} />
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </section>
      )}

      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
              {copy.linksTitle}
            </h2>
            <nav className="mt-7 grid border-t-2 border-[#171b25] sm:grid-cols-2">
              {copy.links.map(([label, href], index) => (
                <Link
                  key={href}
                  href={href}
                  className={`group flex min-h-24 items-center justify-between gap-5 border-b border-[#d8d3ce] px-4 py-5 transition-colors hover:bg-[#f7f4f1] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#BA4811] ${index % 2 === 0 ? "sm:border-r" : ""}`}
                >
                  <span className="text-sm font-semibold transition-colors group-hover:text-[#BA4811]">
                    {label}
                  </span>
                  <span
                    aria-hidden
                    className="text-[#BA4811] transition-transform group-hover:translate-x-1"
                  >
                    <ArrowIcon direction="right" size={16} />
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
              {copy.contactLabel}
            </h2>
            <div className="mt-7 border-l-2 border-[#BA4811] pl-6">
              <p className="max-w-xl text-sm leading-7 text-[#626661]">
                {copy.contactText}
              </p>
              <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold">
                <a
                  className="text-[#BA4811] underline underline-offset-4"
                  href={`mailto:${EMAIL}`}
                >
                  {EMAIL}
                </a>
                <a
                  className="text-[#414541] underline decoration-[#171b25]/25 underline-offset-4"
                  href={`tel:${PHONE.replace(/\s/g, "")}`}
                >
                  {PHONE}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
