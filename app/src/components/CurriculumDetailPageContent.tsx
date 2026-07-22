"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import CtaBanner from "@/components/CtaBanner";
import { api, type Curriculum, type Program } from "@/lib/api";
import {
  localizedProgramText,
  normalizeProgramLevel,
  programDetailHref,
  programLevelPath,
  programsBasePath,
  stripProgramHtml,
  type SiteLocale,
} from "@/lib/program-pages";
import { getLevelDisplay } from "@/utils/common";

import { ArrowIcon } from "@/components/icons/ArrowIcon";

const CurriculumDetailLoading = () => (
  <main className="min-h-screen animate-pulse bg-white">
    <section className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 lg:pb-20">
      <div className="h-3 w-56 bg-[#ebe6e1]" />
      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div>
          <div className="h-3 w-40 bg-[#ebe6e1]" />
          <div className="mt-8 h-32 max-w-3xl bg-[#ebe6e1]" />
          <div className="mt-8 h-20 max-w-2xl bg-[#f2eeea]" />
        </div>
        <div className="h-80 bg-[#e8e2dc]" />
      </div>
    </section>
  </main>
);

const summarizeText = (text: string, maxLength = 210) => {
  if (text.length <= maxLength) return text;

  const shortened = text.slice(0, maxLength);
  return `${shortened
    .slice(0, shortened.lastIndexOf(" "))
    .trim()
    .replace(/[\s,;:()]+$/g, "")}…`;
};

export default function CurriculumDetailPageContent({
  locale,
}: {
  locale: SiteLocale;
}) {
  const params = useParams<{ program: string; slug: string }>();
  const reduceMotion = useReducedMotion();
  const [program, setProgram] = useState<Program | null>(null);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchCurriculum() {
      if (!params?.program || !params?.slug) return;

      try {
        const curriculumWithProgram =
          await api.curriculums.findByProgramAndCurriculumSlug(
            params.program,
            params.slug,
            locale,
          );
        const fullCurriculum = await api.curriculums.findOne(
          curriculumWithProgram.curriculumId,
          true,
        );

        if (!active) return;

        const visibleSections = (fullCurriculum.sections || [])
          .filter((section) => section.isVisible)
          .sort(
            (first, second) =>
              (first.displayOrder || 0) - (second.displayOrder || 0),
          );

        setProgram(curriculumWithProgram.program);
        setCurriculum(fullCurriculum);
        setExpandedSections(
          visibleSections[0]
            ? { [visibleSections[0].sectionId]: true }
            : {},
        );
      } catch (error) {
        console.error("Failed to fetch curriculum detail:", error);
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchCurriculum();
    return () => {
      active = false;
    };
  }, [locale, params?.program, params?.slug]);

  const sections = useMemo(
    () =>
      (curriculum?.sections || [])
        .filter((section) => section.isVisible)
        .sort(
          (first, second) =>
            (first.displayOrder || 0) - (second.displayOrder || 0),
        ),
    [curriculum?.sections],
  );

  const copy =
    locale === "vi"
      ? {
          breadcrumb: "Chương trình đào tạo",
          dossier: "Hồ sơ chương trình đào tạo",
          version: "Phiên bản áp dụng",
          overview: "Tổng quan chương trình đào tạo",
          contents: "Trong hồ sơ này",
          curriculumContent: "Nội dung chương trình",
          curriculumDescription:
            "Mở từng mục để xem chi tiết chuẩn đầu ra, cấu trúc học phần và yêu cầu của chương trình.",
          noSections: "Nội dung chi tiết đang được cập nhật.",
          level: "Bậc đào tạo",
          duration: "Thời lượng",
          credits: "Tín chỉ",
          semesters: "Học kỳ",
          language: "Ngôn ngữ",
          degree: "Văn bằng",
          years: "năm",
          current: "Đang áp dụng",
          document: "Tài liệu chương trình",
          documentDescription:
            "Xem bản chương trình đào tạo đầy đủ để tra cứu các học phần và yêu cầu tốt nghiệp.",
          viewPdf: "Xem chương trình đào tạo (PDF)",
          backToProgram: "Quay lại chương trình",
        }
      : {
          breadcrumb: "Academic programs",
          dossier: "Curriculum dossier",
          version: "Effective version",
          overview: "Curriculum overview",
          contents: "In this dossier",
          curriculumContent: "Program content",
          curriculumDescription:
            "Open each section to review learning outcomes, course structure, and program requirements.",
          noSections: "Detailed curriculum content is being updated.",
          level: "Study level",
          duration: "Duration",
          credits: "Credits",
          semesters: "Semesters",
          language: "Language",
          degree: "Award",
          years: "years",
          current: "Current",
          document: "Program document",
          documentDescription:
            "View the full curriculum document for course and graduation requirements.",
          viewPdf: "View curriculum PDF",
          backToProgram: "Back to program",
        };

  if (loading) return <CurriculumDetailLoading />;
  if (failed || !curriculum || !program) return notFound();

  const curriculumName = localizedProgramText(
    locale,
    curriculum.nameVi,
    curriculum.nameEn,
  );
  const programTitle = localizedProgramText(
    locale,
    program.nameVi,
    program.nameEn,
  );
  const description = stripProgramHtml(
    localizedProgramText(
      locale,
      curriculum.descriptionVi,
      curriculum.descriptionEn,
    ),
  );
  const heroDescription = summarizeText(description);
  const levelKey = normalizeProgramLevel(program.level);
  const programHref = programDetailHref(locale, program);
  const reveal = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0 },
  };
  const facts = [
    {
      label: copy.level,
      value: getLevelDisplay(program.level, locale),
    },
    {
      label: copy.duration,
      value: curriculum.durationYears
        ? `${curriculum.durationYears} ${copy.years}`
        : "—",
    },
    { label: copy.credits, value: curriculum.totalCredits || "—" },
    { label: copy.semesters, value: curriculum.totalSemesters || "—" },
    { label: copy.language, value: curriculum.language || "—" },
    { label: copy.degree, value: curriculum.degreeAwarded || "—" },
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };

  const openSection = (sectionId: string) => {
    setExpandedSections((current) => ({ ...current, [sectionId]: true }));
  };

  return (
    <main className="overflow-hidden bg-white text-[#171b25]">
      <section className="border-b border-[#171b25]/15 bg-white">
        <div className="mx-auto max-w-7xl px-5 pb-12 pt-7 sm:px-8 lg:pb-16">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[#8a8d88]"
          >
            <Link
              href={programsBasePath(locale)}
              className="transition-colors hover:text-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BA4811]"
            >
              {copy.breadcrumb}
            </Link>
            <span aria-hidden className="text-[#BA4811]">
              /
            </span>
            <Link
              href={`${programsBasePath(locale)}/${programLevelPath(locale, levelKey)}`}
              className="transition-colors hover:text-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BA4811]"
            >
              {getLevelDisplay(program.level, locale)}
            </Link>
            <span aria-hidden className="text-[#BA4811]">
              /
            </span>
            <Link
              href={programHref}
              className="max-w-[24rem] truncate transition-colors hover:text-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BA4811]"
            >
              {programTitle}
            </Link>
          </nav>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 max-w-5xl"
          >
            <div className="flex items-center gap-4 font-mono text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[#BA4811]">
              <span className="h-px w-12 bg-current" />
              {copy.dossier} · {program.code}
            </div>
            <h1 className="mt-7 max-w-[22ch] text-[2.65rem] font-bold leading-[1.08] tracking-[-0.032em] text-balance sm:text-[3.35rem] lg:text-[4rem]">
              {curriculumName}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href={programHref}
                className="inline-flex border-b border-[#BA4811]/45 pb-1 text-base font-semibold text-[#BA4811] transition-colors hover:border-[#BA4811] hover:text-[#96380d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
              >
                {programTitle}
              </Link>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[#7b7e79]">
                {copy.version} {curriculum.year}
              </span>
              {curriculum.isCurrent && (
                <span className="border border-[#BA4811]/35 px-2.5 py-1 font-mono text-[0.56rem] font-semibold uppercase tracking-[0.12em] text-[#BA4811]">
                  {copy.current}
                </span>
              )}
            </div>
            {heroDescription && (
              <p className="mt-7 max-w-4xl text-base leading-8 text-[#626661]">
                {heroDescription}
              </p>
            )}
          </motion.div>

          <div className="mt-12 grid border-y border-[#d8d3ce] sm:grid-cols-2 lg:grid-cols-6">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="border-b border-[#d8d3ce] py-5 sm:px-5 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
              >
                <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[#8a8d88]">
                  {fact.label}
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#171b25] sm:text-base">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#f7f4f1] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[#BA4811]">
              {copy.contents}
            </p>
            <div className="mt-5 border-t-2 border-[#171b25]">
              {sections.map((section, index) => (
                <a
                  key={section.sectionId}
                  href={`#curriculum-section-${section.sectionId}`}
                  onClick={() => openSection(section.sectionId)}
                  className="grid min-h-14 grid-cols-[2.25rem_1fr] items-center border-b border-[#d4cec8] py-3 text-[0.78rem] font-semibold leading-5 text-[#5f635e] transition-colors hover:text-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BA4811]"
                >
                  <span className="font-mono text-[0.62rem] text-[#BA4811]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </a>
              ))}
            </div>
          </aside>

          <div>
            <motion.header
              initial="hidden"
              whileInView="visible"
              variants={reveal}
              viewport={{ once: true }}
              className="grid gap-6 border-b-2 border-[#171b25] pb-8 lg:grid-cols-[1fr_0.9fr] lg:items-end"
            >
              <div>
                <p className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#BA4811]">
                  {copy.overview}
                </p>
                <h2 className="mt-4 text-[2.2rem] font-bold leading-[1.05] tracking-[-0.04em] sm:text-[2.9rem]">
                  {copy.curriculumContent}
                </h2>
              </div>
              <p className="max-w-xl text-base leading-8 text-[#686c67]">
                {copy.curriculumDescription}
              </p>
            </motion.header>

            {sections.length > 0 ? (
              <div>
                {sections.map((section, index) => {
                  const expanded = Boolean(expandedSections[section.sectionId]);

                  return (
                    <article
                      id={`curriculum-section-${section.sectionId}`}
                      key={section.sectionId}
                      className="scroll-mt-28 border-b border-[#d4cec8]"
                    >
                      <h3>
                        <button
                          type="button"
                          aria-expanded={expanded}
                          aria-controls={`curriculum-panel-${section.sectionId}`}
                          onClick={() => toggleSection(section.sectionId)}
                          className="group grid w-full grid-cols-[2.75rem_minmax(0,1fr)_2.5rem] items-center gap-4 py-7 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811] sm:grid-cols-[3.5rem_minmax(0,1fr)_3rem] sm:py-8"
                        >
                          <span className="font-mono text-[0.68rem] font-semibold text-[#BA4811]">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="text-lg font-bold leading-7 tracking-[-0.025em] transition-colors group-hover:text-[#BA4811] sm:text-[1.35rem]">
                            {section.title}
                          </span>
                          <span
                            aria-hidden
                            className="flex h-9 w-9 items-center justify-center justify-self-end border border-[#BA4811]/35 text-xl font-light leading-none text-[#BA4811] transition-colors group-hover:bg-[#BA4811] group-hover:text-white"
                          >
                            {expanded ? "−" : "+"}
                          </span>
                        </button>
                      </h3>

                      <div
                        id={`curriculum-panel-${section.sectionId}`}
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                          expanded
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div
                            className="prose prose-slate max-w-none pb-10 pl-[4.25rem] text-base leading-8 text-[#555a55] sm:pl-[5rem] sm:text-[1.05rem] [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-[-0.025em] [&_h2]:text-[#171b25] [&_h3]:mt-7 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[#171b25] [&_li]:my-2 [&_p]:leading-8 [&_table]:my-8 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_td]:min-w-32 [&_td]:border-[#d4cec8] [&_td]:px-4 [&_td]:py-3 [&_td]:text-base [&_th]:min-w-32 [&_th]:border-[#d4cec8] [&_th]:bg-white [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-sm"
                            dangerouslySetInnerHTML={{
                              __html: (section.content || "").replace(
                                /&nbsp;/g,
                                " ",
                              ),
                            }}
                          />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="border-b border-[#d4cec8] py-14 text-base text-[#686c67]">
                {copy.noSections}
              </p>
            )}
          </div>
        </div>
      </section>

      {curriculum.pdfUrl && (
        <section className="border-b border-[#171b25]/15 bg-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[11rem_minmax(0,1fr)_auto] lg:items-center lg:gap-10">
            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#BA4811]">
              {copy.document}
            </p>
            <p className="max-w-3xl text-lg font-bold leading-8 tracking-[-0.02em] sm:text-xl">
              {copy.documentDescription}
            </p>
            <a
              href={curriculum.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex min-h-12 items-center justify-between gap-8 bg-[#BA4811] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#96380d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
            >
              {copy.viewPdf}
              <span className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                <ArrowIcon direction="up-right" size={16} />
              </span>
            </a>
          </div>
        </section>
      )}

      <section className="bg-white px-5 pt-12 sm:px-8 sm:pt-16">
        <div className="mx-auto max-w-7xl border-t border-[#d8d3ce] pt-7">
          <Link
            href={programHref}
            className="inline-flex items-center gap-3 text-sm font-semibold text-[#BA4811] transition-colors hover:text-[#96380d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
          >
            <span aria-hidden><ArrowIcon direction="left" size={16} /></span>
            {copy.backToProgram}
          </Link>
        </div>
      </section>

      <CtaBanner />
    </main>
  );
}
