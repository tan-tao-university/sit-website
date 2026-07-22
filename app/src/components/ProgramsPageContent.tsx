"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { api, type Program } from "@/lib/api";
import {
  localizedProgramText,
  normalizeProgramLevel,
  programDetailHref,
  programImage,
  programLevelPath,
  programsBasePath,
  type ProgramLevelKey,
  type SiteLocale,
} from "@/lib/program-pages";

import { ArrowIcon } from "@/components/icons/ArrowIcon";

type ProgramFilter = "all" | ProgramLevelKey;

const ProgramsPageLoading = () => (
  <main className="min-h-screen animate-pulse bg-[#f7f4f1]">
    <section className="border-b border-[#171b25]/15 px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="h-3 w-40 bg-[#ddd7d1]" />
        <div className="mt-8 h-36 max-w-4xl bg-[#e9e4df]" />
        <div className="mt-8 h-16 max-w-xl bg-[#e9e4df]" />
      </div>
    </section>
    <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[16rem_1fr]">
      <div className="h-64 bg-[#e9e4df]" />
      <div className="space-y-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-28 border-b border-[#ddd7d1] bg-white/60" />
        ))}
      </div>
    </section>
  </main>
);

export default function ProgramsPageContent({ locale }: { locale: SiteLocale }) {
  const t = useTranslations("programs");
  const reduceMotion = useReducedMotion();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filter, setFilter] = useState<ProgramFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    api.programs
      .findAll({ status: "active" })
      .then((data) => {
        if (active) setPrograms(data);
      })
      .catch((fetchError) => {
        console.error("Failed to fetch programs:", fetchError);
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const groupedCounts = useMemo(
    () => ({
      undergraduate: programs.filter(
        ({ level }) => normalizeProgramLevel(level) === "undergraduate",
      ).length,
      graduate: programs.filter(
        ({ level }) => normalizeProgramLevel(level) === "graduate",
      ).length,
    }),
    [programs],
  );
  const visiblePrograms = useMemo(
    () =>
      filter === "all"
        ? programs
        : programs.filter(
            ({ level }) => normalizeProgramLevel(level) === filter,
          ),
    [filter, programs],
  );
  const reveal = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };
  const copy =
    locale === "vi"
      ? {
          directory: "Danh mục học thuật / 2026",
          intro: "Tìm ngành học theo bậc đào tạo, định hướng và con đường bạn muốn theo đuổi.",
          explore: "Khám phá danh mục",
          admissions: "Tuyển sinh",
          filter: "Bộ lọc chương trình",
          results: "chương trình",
          all: "Tất cả",
          empty: "Chưa có chương trình phù hợp với bộ lọc này.",
          index: "Chỉ mục ngành học",
          choose: "Chọn chương trình phù hợp",
          levelFilter: "Bậc đào tạo",
          compare: "Chọn một bậc học để xem lộ trình, thời lượng và các ngành tương ứng.",
        }
      : {
          directory: "Academic directory / 2026",
          intro: "Find a field of study by degree level, direction and the path you want to pursue.",
          explore: "Explore the directory",
          admissions: "Admissions",
          filter: "Program filters",
          results: "programs",
          all: "All programs",
          empty: "No programs match this filter yet.",
          index: "Program index",
          choose: "Choose the right program",
          levelFilter: "Study level",
          compare: "Choose a study level to see its pathway, duration and available programs.",
        };

  if (loading) return <ProgramsPageLoading />;

  if (error) {
    return (
      <main className="flex min-h-[55vh] items-center justify-center bg-[#f7f4f1] px-5">
        <div className="max-w-lg border-l-4 border-[#BA4811] bg-white p-8">
          <p className="text-xl font-bold tracking-tight text-[#171b25]">
            {locale === "vi"
              ? "Không thể tải danh sách chương trình"
              : "Programs could not be loaded"}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 min-h-11 bg-[#BA4811] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#96380d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
          >
            {locale === "vi" ? "Thử lại" : "Try again"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="overflow-hidden bg-white text-[#171b25]">
      <section className="relative border-b border-[#171b25]/15 bg-white">
        <div className="mx-auto max-w-7xl px-5 pb-10 pt-12 sm:px-8 sm:pb-12 sm:pt-16 lg:pt-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_23rem] lg:items-end lg:gap-14"
          >
            <div>
              <div className="flex items-center gap-4 font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#BA4811]">
                <span className="h-px w-12 bg-current" />
                {copy.directory}
              </div>
              <h1 className="mt-7 max-w-[17ch] text-[2.75rem] font-bold leading-[1.03] tracking-[-0.045em] text-balance sm:text-[3.2rem] lg:text-[3.55rem] xl:text-[3.8rem]">
                {t("title")} <span className="text-[#BA4811]">{t("titleHighlight")}</span>
              </h1>
            </div>
            <div className="border-t border-[#171b25]/20 pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <p className="max-w-xl text-sm leading-7 text-[#60645f] sm:text-[0.95rem]">
                {copy.intro}
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                <a
                  href="#program-index"
                  className="group inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-[#171b25] underline decoration-[#BA4811] underline-offset-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
                >
                  {copy.explore}
                  <span className="transition-transform group-hover:translate-y-1"><ArrowIcon direction="down" size={16} /></span>
                </a>
                <a
                  href="https://tuyensinh.ttu.edu.vn"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-[#BA4811] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
                >
                  {copy.admissions}
                  <span className="transition-transform group-hover:translate-x-1"><ArrowIcon direction="up-right" size={16} /></span>
                </a>
              </div>
            </div>
          </motion.div>

          <div className="mt-10 grid h-64 gap-3 sm:h-80 sm:grid-cols-[1.45fr_0.55fr]">
            <div className="relative overflow-hidden bg-[#ece8e4]">
              <img src="/assets/ttu/programs-technology-learning.jpg" alt="" className="h-full w-full object-cover object-center" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#171b25]/45 to-transparent" />
              <span className="absolute bottom-5 left-5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-white sm:left-6">School of Information Technology</span>
            </div>
            <div className="relative hidden overflow-hidden bg-[#ece8e4] sm:block">
              <img src="/assets/ttu/programs-academic-partnership.jpg" alt="" className="h-full w-full object-cover object-center" />
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,27,37,.18)_0%,rgba(17,27,37,.28)_42%,rgba(17,27,37,.88)_100%)]" />
              <div className="absolute inset-4 flex flex-col justify-end border border-white/65 p-4 text-white">
                <div>
                  <span className="text-4xl font-bold tracking-[-0.06em]">{String(programs.length).padStart(2, "0")}</span>
                  <p className="mt-2 max-w-[15rem] text-xs font-medium leading-5 text-white">{t("programsSubtitle")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#171b25]/15 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-3">
            {[
              [programs.length, copy.all],
              [groupedCounts.undergraduate, t("undergraduate")],
              [groupedCounts.graduate, t("graduate")],
            ].map(([value, label], index) => (
              <div
                key={String(label)}
                className={`px-4 py-5 sm:px-8 ${index > 0 ? "border-l border-[#171b25]/15" : ""}`}
              >
                <span className="font-mono text-[0.62rem] text-[#BA4811]">0{index + 1}</span>
                <p className="mt-2 text-sm font-semibold sm:text-base">
                  <span className="mr-2 text-xl font-bold tracking-[-0.04em] sm:text-2xl">{value}</span>
                  <span className="text-[#70736f]">{label}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="program-index" className="relative scroll-mt-24 bg-white py-14 sm:py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-[#dedad5] bg-white">
              <div className="border-b border-[#dedad5] px-5 py-5">
                <p className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#8a8d88]">
                  {copy.filter}
                </p>
                <p className="mt-2 text-base font-bold tracking-[-0.02em] text-[#171b25]">
                  {copy.levelFilter}
                </p>
              </div>
              {(
                [
                  ["all", copy.all, programs.length],
                  ["undergraduate", t("undergraduate"), groupedCounts.undergraduate],
                  ["graduate", t("graduate"), groupedCounts.graduate],
                ] as const
              ).map(([value, label, count]) => {
                const selected = filter === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setFilter(value)}
                    className={`grid min-h-14 w-full grid-cols-[0.5rem_1fr_auto] items-center gap-3 border-b border-[#dedad5] px-5 text-left text-sm transition-colors last:border-b-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BA4811] ${selected ? "bg-[#faf7f4] text-[#BA4811]" : "text-[#686c67] hover:bg-[#faf9f8] hover:text-[#171b25]"}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${selected ? "bg-[#BA4811]" : "bg-[#d5d0ca]"}`} />
                    <span className="font-semibold">{label}</span>
                    <span className="font-mono text-[0.6rem] text-[#8a8d88]">
                      {String(count).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#171b25]/20 pb-6">
              <div>
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#BA4811]">
                  {copy.index}
                </p>
                <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] sm:text-[2rem]">
                  {copy.choose}
                </h2>
              </div>
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[#8a8d88]">
                {visiblePrograms.length} {copy.results}
              </span>
            </div>

            {visiblePrograms.length > 0 ? (
              <div className="mt-7 grid gap-x-5 gap-y-9 sm:grid-cols-2">
                {visiblePrograms.map((program) => {
                  const title = localizedProgramText(locale, program.nameVi, program.nameEn);
                  const level = normalizeProgramLevel(program.level);

                  return (
                    <article
                      key={program.programId}
                      className="group min-w-0"
                    >
                      <Link
                        href={programDetailHref(locale, program)}
                        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA4811]"
                      >
                        <span className="relative block aspect-[16/10] overflow-hidden bg-[#fbf8f5]">
                          <img
                            src={programImage(program)}
                            alt={title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          />
                          <span className="absolute left-4 top-4 bg-white/95 px-3 py-2 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#BA4811] backdrop-blur-sm">
                            {program.majorCode || program.code}
                          </span>
                        </span>
                        <span className="grid grid-cols-[minmax(0,1fr)_2.75rem] gap-4 border-b border-[#dedad5] py-5">
                          <span>
                            <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[#858984]">
                              {level === "undergraduate" ? t("undergraduate") : t("graduate")}
                            </span>
                            <span className="mt-2 block text-lg font-bold leading-snug tracking-[-0.025em] transition-colors group-hover:text-[#BA4811] sm:text-xl">
                              {title}
                            </span>
                          </span>
                          <span className="flex h-11 w-11 items-center justify-center self-end border border-[#BA4811]/30 text-[#BA4811] transition-colors group-hover:bg-[#BA4811] group-hover:text-white">
                            <HugeiconsIcon icon={ArrowUpRight01Icon} size={17} />
                          </span>
                        </span>
                      </Link>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="border-b border-[#dedad5] py-16 text-center text-sm text-[#686c67]">
                {copy.empty}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-[#171b25]/15 bg-[#f7f4f1]">
        <div className="mx-auto grid max-w-7xl md:grid-cols-2">
          {(["undergraduate", "graduate"] as const).map((level, index) => (
            <Link
              key={level}
              href={`${programsBasePath(locale)}/${programLevelPath(locale, level)}`}
              className={`group flex min-h-56 flex-col justify-between p-7 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#BA4811] sm:p-9 ${index > 0 ? "border-t border-[#171b25]/15 md:border-l md:border-t-0" : ""}`}
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[0.64rem] font-semibold text-[#BA4811]">0{index + 1}</span>
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={19} className="text-[#BA4811] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-[-0.04em] sm:text-3xl">
                  {level === "undergraduate" ? t("undergraduate") : t("graduate")}
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-[#6b6f6a]">{copy.compare}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
